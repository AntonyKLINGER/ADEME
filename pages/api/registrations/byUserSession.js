import prisma from '@/prisma';

export default async function handle(req, res) {
  const { userId, sessionId, specialAccount } = req.query;

  if(specialAccount){
    let queryOptions = {
      where: {
        accountId: parseInt(userId),
        sessionId: parseInt(sessionId)
      }
    };
  
    try {
      const registrations = await prisma.accountRegistration.findMany(queryOptions);
      res.json(registrations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des modules' });
    }
  } else {
    let queryOptions = {
      where: {
        userId: parseInt(userId),
        sessionId: parseInt(sessionId)
      }
    };
  
    try {
      const registrations = await prisma.registration.findMany(queryOptions);
      res.json(registrations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des modules' });
    }
  }

}
