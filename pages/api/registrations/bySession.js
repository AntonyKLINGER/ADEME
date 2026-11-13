import prisma from '@/prisma';
import { getSession, isAdmin, isPresenceKiosk, stripPasswords } from '@/utils/auth';

export default async function handle(req, res) {
  const { sessionId } = req.query;

  const parsedSessionId = parseInt(sessionId);

  try {
    // Requête pour récupérer les registrations (utilisateurs)
    const registrations = await prisma.registration.findMany({
      where: {
        sessionId: parsedSessionId,
      },
      include: {
        session: {
          include: {
            reviews: true,
            metasSession: true,
          },
        },
        user: true,
      },
    });

    // Requête pour récupérer les accountRegistrations (administrateurs/DR)
    const accountRegistrations = await prisma.accountRegistration.findMany({
      where: {
        sessionId: parsedSessionId,
      },
      include: {
        session: {
          include: {
            reviews: true,
            metasSession: true,
          },
        },
        account: true, // Include the account data associated with the registration
      },
    });

    // Combiner les deux résultats
    const combinedRegistrations = [
      ...registrations.map(registration => ({
        ...registration,
        type: 'userRegistration', // Pour différencier les types
      })),
      ...accountRegistrations.map(accountRegistration => ({
        ...accountRegistration,
        type: 'accountRegistration', // Pour différencier les types
      })),
    ];

    // Retourner la réponse avec les données combinées. La page publique d'une
    // rencontre ne compte que les inscriptions actives : rien d'autre hors
    // back-office et borne de présence.
    const session = getSession(req);
    res.json(isAdmin(session) || isPresenceKiosk(session)
      ? stripPasswords(combinedRegistrations)
      : combinedRegistrations.map(({ deleted }) => ({ deleted })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des inscriptions' });
  }
}
