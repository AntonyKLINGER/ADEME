import prisma from '@/prisma';
import { requireActAs } from '@/utils/auth';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if (!requireActAs(req, res, req.query.userId, false)) return;

        const userId = parseInt(req.query.userId, 10);
        const status = req.query.status;

        if (!userId) {
            return res.status(400).json({ error: 'L\'ID utilisateur est requis' });
        }

        let dateCondition = {};
        const now = new Date();
        if (status === 'old') {
            dateCondition = {
                dateDebut: {
                    lt: now,
                },
            };
        } else if (status === 'upcoming') {
            dateCondition = {
                dateDebut: {
                    gt: now,
                },
            };
        }

        try {
            const userSessions = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    sessions: {
                        // where: dateCondition,
                        // // include: {
                        // //     module: true,
                        // // },
                    },
                },
            });

            if (!userSessions) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            res.status(200).json(userSessions.sessions);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des sessions de l\'utilisateur' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}
