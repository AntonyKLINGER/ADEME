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
    const moduleId = parseInt(id, 10);

    try {
        // Trouver d'abord toutes les sessions liées au module
        const sessions = await prisma.session.findMany({
            where: { moduleId: moduleId },
            select: { id: true }, // Sélectionner uniquement les ID des sessions
        });

        // Extraire les ID des sessions pour les utiliser dans les requêtes suivantes
        const sessionIds = sessions.map(session => session.id);

        // Supprimer les MetasSession liées à ces sessions
        if (sessionIds.length > 0) {
            await prisma.registration.deleteMany({
                where: { sessionId: { in: sessionIds } },
            });

            await prisma.metasSession.deleteMany({
                where: { sessionId: { in: sessionIds } },
            });

            await prisma.review.deleteMany({
                where: { sessionId: { in: sessionIds } },
            });
        }

        // Ensuite, supprimer les sessions elles-mêmes
        await prisma.session.deleteMany({
            where: { moduleId: moduleId },
        });

        // Supprimer les metasModule liés au module
        await prisma.metasModule.deleteMany({
            where: { moduleId: moduleId },
        });

        // Enfin, supprimer le module
        await prisma.module.delete({
            where: { id: moduleId },
        });

        res.json({ message: 'Module et entités associées supprimées avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Impossible de supprimer le module: ${error.message}` });
    }
}
