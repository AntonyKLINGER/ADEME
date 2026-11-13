import prisma from '@/prisma';
import fetch from 'node-fetch';
import { internalHeaders } from '@/utils/auth';
import { rateLimit } from '@/utils/rateLimit';
import { signResetToken } from '@/utils/session';

// Envoie un lien de réinitialisation : le mot de passe ne change qu'à son
// ouverture (reset-password.js), par la personne qui reçoit l'email.
export default async function handle(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    if (!rateLimit(req, res, 'forgot-password', 5, 15 * 60 * 1000)) return;

    const { mail } = req.body;

    try {
        if (typeof mail === 'string' && mail) {
            const user = await prisma.user.findUnique({ where: { mail } });
            const account = user ? null : await prisma.account.findUnique({ where: { email: mail } });
            const target = user
                ? { id: user.id, account: false, hash: user.motDePasse }
                : account && { id: account.id, account: true, hash: account.password };

            if (target) {
                const token = signResetToken(target);
                // Sans attendre l'envoi : le temps de réponse ne doit pas dire
                // si l'adresse a un compte.
                fetch(`${process.env.WEBSITE_URL}/api/emails/newPassword`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        ...internalHeaders(),
                    },
                    body: JSON.stringify({
                        email: mail,
                        resetUrl: `${process.env.WEBSITE_URL}/api/users/lib/reset-password?token=${encodeURIComponent(token)}`,
                    })
                }).catch((error) => console.error(error));
            }
        }
    } catch (error) {
        console.error(error);
    }

    // Même réponse que l'adresse ait un compte ou non.
    return res.json({ success: true });
}
