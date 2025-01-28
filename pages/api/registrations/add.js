import prisma from '@/prisma';
import fetch from 'node-fetch';

export default async function handle(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    const { inscriptionData, userId, sessionId, type } = req.body;

    if (!userId || !sessionId || !inscriptionData || !type) {
        return res.status(400).json({ error: 'Missing required fields: userId, sessionId, inscriptionData, or type' });
    }

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

        let firstDayStartTime;
        const firstProgramme = sessionData.metasSession.programmeSession[0];

        if (firstProgramme.horaires.includes('Jour')) {
            firstDayStartTime = firstProgramme.horaires.split(' : ')[1].split(' - ')[0];
        } else {
            firstDayStartTime = firstProgramme.horaires.split(' - ')[0].trim();
        }

        const dateDebut = new Date(sessionData.dateDebut);
        const formattedDateDebut = dateDebut.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const sending = {
            prenom: type == 'special' ? inscriptionData.prenom : userData.prenom,
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
            },
            body: JSON.stringify({
                prenom: type == 'special' ? inscriptionData.prenom : userData.prenom,
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
        return res.status(500).json({
            error: `Impossible de créer l'enregistrement : ${error.message}`,
            stack: error.stack, // Inclure la trace de l'erreur pour plus de détails
        });
    }
}
