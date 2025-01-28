import bcrypt from 'bcrypt';
import prisma from '@/prisma';
import fetch from 'node-fetch';

const SALT_ROUNDS = 10;

function generatePassword(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

export default async function handle(req, res) {
    if (req.method === 'POST') {
        const { email, type, modules, regions } = req.body;

        try {
            // Vérifier si un compte avec cet email existe déjà
            const existingAccount = await prisma.account.findUnique({
                where: { email },
            });

            if (existingAccount) {
                res.status(200).json({ status: 'already exist' });
                return;
            }

            // Générer un mot de passe de 12 caractères
            let password = generatePassword(12);
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            const newAccount = await prisma.account.create({
                data: {
                    email,
                    type,
                    password: hashedPassword,
                    modules,
                    regions
                },
            });

            await fetch(`${process.env.WEBSITE_URL}/api/emails/newAccount`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    type,
                    password,
                    modules,
                    regions
                }),
            });

            res.status(201).json({ status: 'success' });
        } catch (error) {
            res.status(500).json({ error: `Impossible de créer le compte: ${error.message}` });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
