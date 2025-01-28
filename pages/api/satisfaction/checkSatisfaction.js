import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId, sessionId, specialAccount } = req.query;

    if(specialAccount){
      try {
        const satisfaction = await prisma.accountSatisfaction.findFirst({
          where: {
            accountId: parseInt(userId),
            sessionId: parseInt(sessionId),
          },
        });
        if (satisfaction) {
          res.status(200).json({ hasResponded: true });
        } else {
          res.status(200).json({ hasResponded: false });
        }
      } catch (error) {
        console.error('Error checking satisfaction:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification de la satisfaction.' });
      }
    } else {
      try {
        const satisfaction = await prisma.satisfaction.findFirst({
          where: {
            userId: parseInt(userId),
            sessionId: parseInt(sessionId),
          },
        });
        if (satisfaction) {
          res.status(200).json({ hasResponded: true });
        } else {
          res.status(200).json({ hasResponded: false });
        }
      } catch (error) {
        console.error('Error checking satisfaction:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification de la satisfaction.' });
      }
    }

  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
