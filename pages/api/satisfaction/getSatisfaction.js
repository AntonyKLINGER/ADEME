import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction pour sérialiser correctement les BigInt
function serializeBigIntFields(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId, sessionId, type } = req.query;

    try {
      let satisfaction;

      if (type === 'special') {
        // Recherche dans la table accountSatisfaction si type == "special"
        satisfaction = await prisma.accountSatisfaction.findFirst({
          where: {
            accountId: userId ? parseInt(userId) : undefined,
            sessionId: sessionId ? parseInt(sessionId) : undefined,
          },
        });
      } else {
        // Recherche dans la table satisfaction pour tous les autres types
        satisfaction = await prisma.satisfaction.findFirst({
          where: {
            userId: userId ? parseInt(userId) : undefined,
            sessionId: sessionId ? parseInt(sessionId) : undefined,
          },
        });
      }

      if (satisfaction) {
        // Utilisez la fonction serializeBigIntFields pour convertir correctement les BigInt
        res.status(200).json(serializeBigIntFields(satisfaction));
      } else {
        res.status(404).json({ error: 'Satisfaction non trouvée.' });
      }
    } catch (error) {
      console.error('Error fetching satisfaction:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la satisfaction.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
