import prisma from '@/prisma';
import fetch from 'node-fetch';
import { internalHeaders, requireActAs } from '@/utils/auth';

export default async function handle(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    const { userId, sessionId, type } = req.body;
    // Champs saisis dans le formulaire seulement : ni rôle, ni présence, ni
    // statut, ni identifiants, ni écriture imbriquée sur une relation.
    const inscriptionData = req.body.inscriptionData && Object.fromEntries(
        Object.entries(req.body.inscriptionData).filter(([key, value]) =>
            !['id', 'userId', 'accountId', 'sessionId', 'role', 'presence', 'deleted'].includes(key)
            && (value === null || ['string', 'number', 'boolean'].includes(typeof value))));

    if (!userId || !sessionId || !inscriptionData || !type) {
        return res.status(400).json({ error: 'Missing required fields: userId, sessionId, inscriptionData, or type' });
    }

    if (!requireActAs(req, res, userId, type === 'special')) return;

    try {
        console.log("Début de la requête");
        
        // Récupérer les données de la session
        const sessionData = await prisma.session.findUnique({
            where: { id: parseInt(sessionId) },
            include: {
                metasSession: true,
                module: true
            }
        });

        if (!sessionData) {
            return res.status(404).json({ error: 'Session non trouvée' });
        }

        if (sessionData.status === 'closed' || sessionData.status === 'brouillon') {
            return res.status(403).json({ error: 'Les inscriptions sont fermées pour cette session.' });
        }

        console.log("Session trouvée :", sessionData);

        let userData;
        let newRegistration;

        // Traiter en fonction du type (special ou normal)
        if (type === 'special') {
            userData = await prisma.account.findUnique({
                where: { id: parseInt(userId) },
            });

            if (!userData) {
                return res.status(404).json({ error: 'Compte non trouvé' });
            }

            newRegistration = await prisma.accountRegistration.create({
                data: {
                    ...inscriptionData,
                    deleted: false,
                    account: {
                        connect: { id: parseInt(userId) },
                    },
                    session: {
                        connect: { id: parseInt(sessionId) },
                    }
                }
            });
        } else {
            userData = await prisma.user.findUnique({
                where: { id: parseInt(userId) },
            });

            if (!userData) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            newRegistration = await prisma.registration.create({
                data: {
                    ...inscriptionData,
                    deleted: false,
                    user: {
                        connect: { id: parseInt(userId) },
                    },
                    session: {
                        connect: { id: parseInt(sessionId) },
                    }
                }
            });
        }

        console.log("Nouvelle inscription créée :", newRegistration);

        // Fonction pour formater les dates en évitant les problèmes de timezone
        function formatDateFromSession(session) {
            // Priorité au champ dateHoraires si disponible
            if (session?.metasSession?.dateHoraires) {
                const dateHoraires = session.metasSession.dateHoraires;
                
                // Si c'est au format YYYY-MM-DD, on le convertit au format DD/MM/YYYY
                if (dateHoraires.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [year, month, day] = dateHoraires.split('-');
                    return `${day}/${month}/${year}`;
                }
                // Si c'est déjà au format DD/MM/YYYY ou autre texte, on le retourne tel quel
                else if (dateHoraires.includes('/') && dateHoraires.split('/').length === 3) {
                    return dateHoraires;
                }
            }
            
            // Fallback : formatage manuel sans timezone
            const dateDebut = new Date(session.dateDebut);
            const day = dateDebut.getUTCDate().toString().padStart(2, '0');
            const month = (dateDebut.getUTCMonth() + 1).toString().padStart(2, '0');
            const year = dateDebut.getUTCFullYear();
            return `${day}/${month}/${year}`;
        }

        let firstDayStartTime;
        const firstProgramme = sessionData.metasSession.programmeSession[0];

        if (firstProgramme.horaires.includes('Jour')) {
            firstDayStartTime = firstProgramme.horaires.split(' : ')[1].split(' - ')[0];
        } else {
            firstDayStartTime = firstProgramme.horaires.split(' - ')[0].trim();
        }

        const formattedDateDebut = formatDateFromSession(sessionData);

        const sending = {
            prenom: type == 'special' ? (inscriptionData.prenom !== null && inscriptionData.prenom != undefined) ? inscriptionData.prenom : inscriptionData.email : userData.prenom,
            email: type == 'special' ? userData.email : userData.mail,
            nomRencontre: sessionData.module.nom,
            dateRencontre: formattedDateDebut,
            lieuRencontre: sessionData.metasSession.lieuRencontre || 'Lieu',
            nbJours: sessionData.metasSession.nombreJours,
            mail_referent: sessionData.metasSession.mail_referent,
            firstDayStartTime: firstDayStartTime
        }

        // Envoi d'email
        const emailResponse = await fetch(`${process.env.WEBSITE_URL}/api/emails/sessionRegister`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                ...internalHeaders(),
            },
            body: JSON.stringify({
                prenom: type == 'special' ? (inscriptionData.prenom !== null && inscriptionData.prenom != undefined) ? inscriptionData.prenom : inscriptionData.email : userData.prenom,
                email: type == 'special' ? userData.email : userData.mail,
                nomRencontre: sessionData.module.nom,
                dateRencontre: formattedDateDebut,
                lieuRencontre: sessionData.metasSession.lieuRencontre || 'Lieu',
                nbJours: sessionData.metasSession.nombreJours,
                mail_referent: sessionData.metasSession.mail_referent,
                firstDayStartTime: firstDayStartTime
            })
        });

        if (!emailResponse.ok) {
            const emailErrorText = await emailResponse.text();
            return res.status(500).json({ error: `Échec de l'envoi de l'email`, details: emailErrorText });
        }

        console.log("Email envoyé avec succès");

        return res.status(200).json({
            registration: newRegistration,
            session: sessionData,
            sending: sending
        });

    } catch (error) {
        // Log plus détaillé dans la réponse JSON
        console.error(error);
        return res.status(500).json({ error: "Impossible de créer l'enregistrement" });
    }
}
