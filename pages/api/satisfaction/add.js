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
  if (req.method === 'POST') {
    const { userId, sessionId, registrationId, responses, type } = req.body;

    try {
      console.log('Creating new satisfaction with data:', { userId, sessionId, responses, type });
      
      let newSatisfaction;

      if (type === 'special') {
        // Création dans accountSatisfaction si type == "special"
        newSatisfaction = await prisma.accountSatisfaction.create({
          data: {
            accountId: userId ? parseInt(userId) : null,
            sessionId: sessionId ? parseInt(sessionId) : null,
            registrationId: registrationId ? parseInt(registrationId) : null,
            responses: responses ? responses : null,
          },
        });
      } else {
        // Création dans satisfaction pour tous les autres types
        newSatisfaction = await prisma.satisfaction.create({
          data: {
            userId: userId ? parseInt(userId) : null,
            sessionId: sessionId ? parseInt(sessionId) : null,
            registrationId: registrationId ? parseInt(registrationId) : null,
            responses: responses ? responses : null,
          },
        });
      }

      // Utilisez la fonction serializeBigIntFields pour convertir correctement les BigInt
      res.status(201).json(serializeBigIntFields(newSatisfaction));
    } catch (error) {
      console.error('Error creating satisfaction:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la satisfaction.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
