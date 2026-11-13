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
  if (req.method === 'GET') {
    const { sessionId } = req.query;

    try {
      console.log("Session ID reçu : ", sessionId);

      // Récupérer les satisfactionAfters des utilisateurs
      const satisfactionAfter = await prisma.satisfactionAfter.findMany({
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

      // Récupération des satisfactionAfters des comptes spéciaux
      const accountSatisfactionAfter = await prisma.accountSatisfactionAfter.findMany({
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
      const combinedSatisfactionAfter = [
        ...satisfactionAfter.map(item => ({
          ...item,
          source: 'user', // Identifier la source de la satisfactionAfter
        })),
        ...accountSatisfactionAfter.map(item => ({
          ...item,
          source: 'account', // Identifier la source de la satisfactionAfter
        })),
      ];

      // Utilisation de la fonction serializeBigIntFields pour convertir correctement les BigInt
      res.status(200).json(serializeBigIntFields(combinedSatisfactionAfter));
    } catch (error) {
      console.error('Error fetching satisfactionAfter:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la satisfactionAfter.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
