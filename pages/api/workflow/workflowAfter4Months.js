import prisma from '@/prisma';
import fetch from 'node-fetch';
import { requireInternalOrAdmin, internalHeaders } from '@/utils/auth';

export default async function handle(req, res) {
    if (!requireInternalOrAdmin(req, res)) return;
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    try {
        const nowUTC = new Date();
        const today = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate(), 16, 30, 0));

        const sessions = await prisma.session.findMany({
            where: {
                dateDebut: {
                    lte: today,
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

        for (const session of sessions) {
            const dateDebut = new Date(session.dateDebut);
            const monthsLater = new Date(dateDebut);
            monthsLater.setMonth(monthsLater.getMonth() + 4); // +4 mois

            // Compare uniquement la date, pas l’heure
            if (today.toDateString() === monthsLater.toDateString()) {
                await sendEmails(session);
            }
        }

        res.status(200).json({ message: "4-month emails processed successfully" });
    } catch (error) {
        console.error("Error processing 4-month sessions: ", error);
        res.status(500).json({ error: `Failed to process 4-month sessions: ${error.message}` });
    }
}

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

// Fonction d'envoi avec gestion BCC pour le premier email
async function sendEmails(session) {
    const formattedDateDebut = formatDateFromSession(session);
    let isFirstEmail = true;

    for (const registration of session.registrations) {
        const userData = registration.user;

        const emailResponse = await fetch(`${process.env.WEBSITE_URL}/api/emails/sessionAfter4Months`, {
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
                isFirstEmailInLoop: isFirstEmail
            }),
        });

        isFirstEmail = false;

        if (!emailResponse.ok) {
            throw new Error(`Email request failed for user with status ${emailResponse.status}`);
        }
    }

    for (const accountRegistration of session.accountRegistrations) {
        const accountData = accountRegistration.account;

        const emailResponse = await fetch(`${process.env.WEBSITE_URL}/api/emails/sessionAfter4Months`, {
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
                isFirstEmailInLoop: isFirstEmail
            }),
        });

        isFirstEmail = false;

        if (!emailResponse.ok) {
            throw new Error(`Email request failed for account with status ${emailResponse.status}`);
        }
    }
}
