import prisma from '@/lib/prisma';
import { requireAdmin } from '@/utils/auth';

// Fonction pour sérialiser correctement les BigInt
function serializeBigIntFields(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const userId = req.query.userId ? parseInt(req.query.userId, 10) : undefined;
  const sessionId = req.query.sessionId ? parseInt(req.query.sessionId, 10) : undefined;
  const { type } = req.query;

  try {
    const satisfactionAfter = type === 'special'
      ? await prisma.accountSatisfactionAfter.findFirst({
          where: { accountId: userId, sessionId }
        })
      : await prisma.satisfactionAfter.findFirst({
          where: { userId, sessionId }
        });

    if (satisfactionAfter) {
      res.status(200).json(serializeBigIntFields(satisfactionAfter));
    } else {
      res.status(404).json({ error: 'SatisfactionAfter non trouvée.' });
    }
  } catch (error) {
    console.error('Error fetching satisfactionAfter:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la satisfactionAfter.' });
  }
}
