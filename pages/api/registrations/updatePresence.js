import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { userId, accountId, sessionId, presence } = req.body;

    try {
      let updatedRegistration;

      if (userId) {
        // Mettre à jour dans la table registration pour les utilisateurs standards
        updatedRegistration = await prisma.registration.updateMany({
          where: {
            userId: parseInt(userId),
            sessionId: parseInt(sessionId),
          },
          data: {
            presence: presence,
          },
        });
      } else if (accountId) {
        // Mettre à jour dans la table accountRegistration pour les comptes spéciaux
        updatedRegistration = await prisma.accountRegistration.updateMany({
          where: {
            accountId: parseInt(accountId),
            sessionId: parseInt(sessionId),
          },
          data: {
            presence: presence,
          },
        });
      } else {
        return res.status(400).json({ message: 'Either userId or accountId is required' });
      }

      if (updatedRegistration.count === 0) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      res.status(200).json(updatedRegistration);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update presence', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
