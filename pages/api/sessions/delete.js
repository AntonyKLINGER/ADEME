import prisma from '@/prisma'
import { requireAdmin } from '@/utils/auth';

export default async function handle(req, res) {
    if (req.method !== 'DELETE') {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    if (!requireAdmin(req, res)) return;

    const { id } = req.query;

    try {
        await prisma.review.deleteMany({
            where: { sessionId: parseInt(id) },
        });

        await prisma.registration.deleteMany({
            where: { sessionId: parseInt(id) },
        });

        await prisma.metasSession.deleteMany({
            where: { sessionId: parseInt(id) },
        });

        await prisma.session.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: 'Session et MetasSession associés supprimés avec succès' });
    } catch (error) {
        res.status(500).json({ error: `Impossible de supprimer la session: ${error.message}` });
    }
}
