import prisma from '@/prisma'
import { requireAdmin } from '@/utils/auth';

export default async function handle(req, res) {
    if (!requireAdmin(req, res)) return;
    if (req.method === 'POST') {
        const { id, status } = req.body;

        const allowedStatuses = ['publish', 'brouillon', 'closed'];
        const targetStatus = allowedStatuses.includes(status) ? status : 'publish';

        try {
            const now = new Date()

            const updatedSession = await prisma.session.update({
                where: { id: parseInt(id) },
                data: {
                    status: targetStatus,
                    lastUpdate: now
                }
            });

            res.json(updatedSession);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
