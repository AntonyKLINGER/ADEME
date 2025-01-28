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
    const { sessionId } = req.query;

    try {
      console.log("Session ID reçu : ", sessionId);

      // Récupérer les satisfactions des utilisateurs
      const satisfaction = await prisma.satisfaction.findMany({
        where: {
          sessionId: sessionId ? parseInt(sessionId) : undefined,
        },
        include: {
          User: { // Inclure les informations de l'utilisateur
            select: {
              nom: true,
              prenom: true,
              registrations: true
            },
          },
          Session: true, // Inclure la session si nécessaire
          // Registration: { // Inclure les informations de la registration
          //   select: {
          //     id: true,
          //     mail: true,
          //     structure: true,
          //     fonction: true,
          //     typeFonction: true, 
          //     ville: true
          //   },
          // },
        },
      });

      // Récupération des satisfactions des comptes spéciaux
      const accountSatisfaction = await prisma.accountSatisfaction.findMany({
        where: {
          sessionId: sessionId ? parseInt(sessionId) : undefined,
        },
        include: {
          Account: { // Inclure les informations du compte
            select: {
              email: true,
              type: true,
              accountRegistrations: true,
            },
          },
          Session: true, // Inclure la session si nécessaire
          // AccountRegistration: { // Inclure les informations de la registration
          //   select: {
          //     id: true,
          //     nom: true,
          //     prenom: true,
          //     structure: true,
          //     fonction: true,
          //     typeFonction: true, 
          //     ville: true
          //   },
          // },
        },
      });

      // Combinaison des résultats
      const combinedSatisfaction = [
        ...satisfaction.map(item => ({
          ...item,
          source: 'user', // Identifier la source de la satisfaction
        })),
        ...accountSatisfaction.map(item => ({
          ...item,
          source: 'account', // Identifier la source de la satisfaction
        })),
      ];

      // Utilisation de la fonction serializeBigIntFields pour convertir correctement les BigInt
      res.status(200).json(serializeBigIntFields(combinedSatisfaction));
    } catch (error) {
      console.error('Error fetching satisfaction:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la satisfaction.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
