import bcrypt from 'bcrypt';
import prisma from '@/prisma';
import { setSessionCookie } from '@/utils/session';
import { rateLimit } from '@/utils/rateLimit';

export default async function handle(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    if (!rateLimit(req, res, 'login', 10, 15 * 60 * 1000)) return;

    const { mail, motDePasse } = req.body;
    const account = mail && motDePasse
        ? await prisma.account.findUnique({ where: { email: mail } })
        : null;

    if (!account || !account.password || !(await bcrypt.compare(motDePasse, account.password))) {
        res.status(401).json({ success: false, message: 'Identifiant ou mot de passe invalide(s)' });
        return;
    }

    setSessionCookie(res, {
        account: true,
        mail: account.email,
        id: account.id,
        type: account.type,
        regions: account.regions,
        modules: account.modules,
    });

    res.status(200).json({ success: true, id: account.id });
}
