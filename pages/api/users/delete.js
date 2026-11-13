import prisma from '@/prisma'
import { requireActAs } from '@/utils/auth';

export default async function handle(req, res) {
    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!requireActAs(req, res, id, false)) return;
        const userId = parseInt(id);

        try {

            await prisma.registration.deleteMany({
                where: { userId: userId },
            });

            await prisma.review.deleteMany({
                where: { userId: userId },
            });

            await prisma.user.delete({
                where: { id: userId },
            });

            res.json({ message: 'User supprimé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Impossible de supprimer le user : ${error.message}` });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
