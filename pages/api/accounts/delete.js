import prisma from '@/prisma'
import { requireAdmin } from '@/utils/auth';

export default async function handle(req, res) {
    if (!requireAdmin(req, res)) return;
    if (req.method === 'DELETE') {
        const { id } = req.query;
        const accountId = parseInt(id);

        try {

            await prisma.account.delete({
                where: { id: accountId },
            });

            res.json({ message: 'Compte supprimé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Impossible de supprimer le compte : ${error.message}` });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
