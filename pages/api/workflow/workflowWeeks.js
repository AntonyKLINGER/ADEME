import prisma from '@/prisma'
import fetch from 'node-fetch'
import { requireInternalOrAdmin, internalHeaders } from '@/utils/auth';

export default async function handle(req, res) {
    if (!requireInternalOrAdmin(req, res)) return;
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }
    
    try {
        const today = new Date();
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 14);
        threeDaysLater.setHours(0, 0, 0, 0);
        
        const startOfDay = new Date(threeDaysLater);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(threeDaysLater);
        endOfDay.setHours(23, 59, 59, 999);
        
        const upcomingSessions = await prisma.session.findMany({
            where: {
                dateDebut: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
            include: {
                registrations: {
                    where: {
                      deleted: false,
                    },
                    include: {
                      user: true,
                    },
                },
                accountRegistrations: {
                    where: {
                        deleted: false,
                    },
                    include: {
                        account: true,
                    },
                },
                metasSession: true,
                module: true,
            },
        });

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

        for (const session of upcomingSessions) {
            const firstProgramme = session.metasSession.programmeSession[0];
            let firstDayStartTime;

            if (firstProgramme.horaires.includes('Jour')) {
                firstDayStartTime = firstProgramme.horaires.split(' : ')[1].split(' - ')[0];
            } else {
                firstDayStartTime = firstProgramme.horaires.split(' - ')[0].trim();
            }

            const formattedDateDebut = formatDateFromSession(session);
            let isFirstEmail = true;

            for (const registration of session.registrations) {
                const userData = registration.user;

                const emailResponse = await fetch(`${process.env.WEBSITE_URL}/api/emails/sessionWeeks`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        ...internalHeaders(),
                    },
                    body: JSON.stringify({
                        prenom: userData.prenom,
                        email: userData.mail,
                        nomRencontre: session.module.nom,
                        dateRencontre: formattedDateDebut,
                        lieuRencontre: session.metasSession.lieuRencontre || 'Lieu',
                        nbJours: session.metasSession.nombreJours,
                        mail_referent: session.metasSession.mail_referent,
                        firstDayStartTime: firstDayStartTime,
                        isFirstEmailInLoop: isFirstEmail
                    })
                });

                isFirstEmail = false;

                if (!emailResponse.ok) {
                    throw new Error(`Email request failed with status ${emailResponse.status}`);
                }
            }

            for (const accountRegistration of session.accountRegistrations) {
                const accountData = accountRegistration.account;
        
                const emailResponse = await fetch(`${process.env.WEBSITE_URL}/api/emails/sessionWeeks`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        ...internalHeaders(),
                    },
                    body: JSON.stringify({
                        prenom: accountData.email.split('@')[0],
                        email: accountData.email,
                        nomRencontre: session.module.nom,
                        dateRencontre: formattedDateDebut,
                        lieuRencontre: session.metasSession.lieuRencontre || 'Lieu',
                        nbJours: session.metasSession.nombreJours,
                        mail_referent: session.metasSession.mail_referent,
                        firstDayStartTime: firstDayStartTime,
                        isFirstEmailInLoop: isFirstEmail
                    })
                });

                isFirstEmail = false;
        
                if (!emailResponse.ok) {
                    throw new Error(`Email request failed with status ${emailResponse.status}`);
                }
            }  
        }

        res.status(200).json({ message: "Emails sent successfully" });
    } catch (error) {
        console.error("Error fetching upcoming sessions or sending emails: ", error);
        res.status(500).json({ error: `Impossible de récupérer les enregistrements ou d'envoyer les emails : ${error.message}` });
    }
}
