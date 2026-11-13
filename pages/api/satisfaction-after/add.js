import prisma from '@/lib/prisma';
import { requireActAs } from '@/utils/auth';

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

    if (!requireActAs(req, res, userId, type === 'special')) return;

    try {
      console.log('Creating new satisfactionAfter with data:', { userId, sessionId, responses, type });
      
      let newSatisfactionAfter;

      if (type === 'special') {
        // Création dans accountSatisfactionAfterAfter si type == "special"
        newSatisfactionAfter = await prisma.accountSatisfactionAfter.create({
          data: {
            accountId: userId ? parseInt(userId) : null,
            sessionId: sessionId ? parseInt(sessionId) : null,
            registrationId: registrationId ? parseInt(registrationId) : null,
            responses: responses ? responses : null,
          },
        });
      } else {
        // Création dans satisfactionAfter pour tous les autres types
        newSatisfactionAfter = await prisma.satisfactionAfter.create({
          data: {
            userId: userId ? parseInt(userId) : null,
            sessionId: sessionId ? parseInt(sessionId) : null,
            registrationId: registrationId ? parseInt(registrationId) : null,
            responses: responses ? responses : null,
          },
        });
      }

      // Utilisez la fonction serializeBigIntFields pour convertir correctement les BigInt
      res.status(201).json(serializeBigIntFields(newSatisfactionAfter));
    } catch (error) {
      console.error('Error creating satisfactionAfter:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la satisfactionAfter.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
