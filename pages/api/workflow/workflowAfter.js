import prisma from '@/prisma';
import fetch from 'node-fetch';

export default async function handle(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    try {
        // Heure actuelle en UTC (16:30) -
        const nowUTC = new Date();
        const today = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate(), 16, 30, 0));

        // Récupérer toutes les sessions pertinentes
        const sessions = await prisma.session.findMany({
            where: {
                dateDebut: {
                    lte: today,
                },
            },
            include: {
                registrations: {
                    include: {
                        user: true,
                    },
                },
                accountRegistrations: {
                    include: {
                        account: true,
                    },
                },
                metasSession: true,
            },
        });

        for (const session of sessions) {
            const dateDebut = new Date(session.dateDebut);
            
            // Conversion de `nombreJours` (texte) en nombre
            const sessionDurationText = session.metasSession.nombreJours.replace(',', '.'); // Remplace virgule par point
            const sessionDuration = parseFloat(sessionDurationText);

            // Si durée est inférieure ou égale à 1 (inclut 0,5), considérer comme 1 jour
            if (sessionDuration <= 1 && today.toDateString() === dateDebut.toDateString()) {
                // Session d'un jour
                await sendEmails(session);
            } else if (sessionDuration === 2) {
                // Session de 2 jours : envoyer le deuxième jour
                const secondDayDate = new Date(dateDebut);
                secondDayDate.setDate(dateDebut.getDate() + 1); // Jour 2 = dateDebut + 1

                if (today.toDateString() === secondDayDate.toDateString()) {
                    await sendEmails(session);
                }
            }
        }

        res.status(200).json({ message: "Emails processed successfully" });
    } catch (error) {
        console.error("Error processing sessions or sending emails: ", error);
        res.status(500).json({ error: `Failed to process sessions or send emails: ${error.message}` });
    }
}

// Fonction pour envoyer les emails aux participants (utilisateurs et comptes)
async function sendEmails(session) {
    // Envoi aux utilisateurs inscrits
    for (const registration of session.registrations) {
        const userData = registration.user;

        const emailResponse = await fetch(`${process.env.WEBSITE_URL}/api/emails/sessionAfterDays`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prenom: userData.prenom,
                email: userData.mail,
            }),
        });

        if (!emailResponse.ok) {
            throw new Error(`Email request failed for user with status ${emailResponse.status}`);
        }
    }

    // Envoi aux comptes inscrits
    for (const accountRegistration of session.accountRegistrations) {
        const accountData = accountRegistration.account;

        const emailResponse = await fetch(`${process.env.WEBSITE_URL}/api/emails/sessionAfterDays`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prenom: accountData.email.split('@')[0], // Prénom basé sur l'email
                email: accountData.email,
            }),
        });

        if (!emailResponse.ok) {
            throw new Error(`Email request failed for account with status ${emailResponse.status}`);
        }
    }
}
