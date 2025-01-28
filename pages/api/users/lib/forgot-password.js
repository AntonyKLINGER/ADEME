import bcrypt from 'bcrypt';
import prisma from '@/prisma';
const crypto = require('crypto');
import fetch from 'node-fetch';

function generatePassword(length = 10) {
    return crypto.randomBytes(length)
        .toString('base64')
        .replace(/\+/g, '0')
        .replace(/\//g, '0')
        .substring(0, length);
}

const SALT_ROUNDS = 10;

export default async function handle(req, res) {
    if (req.method === 'POST') {
        const { mail } = req.body;

        try {
            const newPassword = generatePassword();
            const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

            // Vérifier si le mail existe dans `user`
            const user = await prisma.user.findUnique({
                where: { mail: mail }
            });

            if (user) {
                // Si l'utilisateur existe, mettre à jour le mot de passe
                const updatedUser = await prisma.user.update({
                    where: { mail: mail },
                    data: {
                        motDePasse: hashedPassword
                    },
                });

                // Envoyer un email avec le nouveau mot de passe
                await fetch(`${process.env.WEBSITE_URL}/api/emails/newPassword`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: mail,
                        password: newPassword
                    })
                });

                return res.json(updatedUser);
            } else {
                // Si l'utilisateur n'existe pas dans `user`, chercher dans `account`
                const account = await prisma.account.findUnique({
                    where: { email: mail }
                });

                if (account) {
                    // Si un compte existe, mettre à jour le mot de passe
                    const updatedAccount = await prisma.account.update({
                        where: { email: mail },
                        data: {
                            password: hashedPassword
                        },
                    });

                    // Envoyer un email avec le nouveau mot de passe
                    await fetch(`${process.env.WEBSITE_URL}/api/emails/newPassword`, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: mail,
                            password: newPassword
                        })
                    });

                    return res.json(updatedAccount);
                } else {
                    // Si aucun utilisateur ou compte n'est trouvé
                    throw new Error('Email not found in both user and account.');
                }
            }
        } catch (error) {
            // Gérer les erreurs
            return res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
