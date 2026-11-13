import prisma from '@/prisma';
import { requireAdmin } from '@/utils/auth';

export default async function handle(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    if (!requireAdmin(req, res)) return;

    const { sessionId, sessionData, metasSessionData } = req.body;

    try {
        const now = new Date();

        const updatedSession = await prisma.session.update({
            where: { id: parseInt(sessionId) },
            data: {
                ...sessionData,
                lastUpdate: now,
                dateDebut: new Date(metasSessionData.dateHoraires),
                metasSession: {
                    update: {
                        ...metasSessionData
                    },
                },
            },
            include: { metasSession: true },
        });

        res.json(updatedSession);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la session:", error.message);
        res.status(500).json({ error: error.message });
    }
}
