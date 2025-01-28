import bcrypt from 'bcrypt';
import prisma from '@/prisma';
import fetch from 'node-fetch';

const SALT_ROUNDS = 10;

export default async function handle(req, res) {
    if (req.method === 'PUT') {
        const { id, email, type, modules, regions } = req.body;

        try {
            // Vérifier si un compte avec cet email existe déjà et ne pas autoriser la mise à jour si l'email appartient à un autre compte
            const existingAccount = await prisma.account.findUnique({
                where: { email },
            });

            if (existingAccount && existingAccount.id !== id) {
                res.status(200).json({ status: 'already exist' });
                return;
            }

            const updatedAccount = await prisma.account.update({
                where: { id },
                data: {
                    email,
                    type,
                    modules,
                    regions
                },
            });

            res.status(200).json({ status: 'success' });
        } catch (error) {
            res.status(500).json({ error: `Impossible de mettre à jour le compte: ${error.message}` });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
