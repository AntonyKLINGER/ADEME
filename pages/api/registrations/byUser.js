import prisma from '@/prisma';

export default async function handle(req, res) {
  const { userId, status, specialAccount } = req.query;

  let dateCondition = {};
  let now = new Date();

  if (status) {
    if (status === 'upcoming') {
      dateCondition = {
        dateDebut: {
          gt: now,
        },
      };
    } else if (status === 'old') {
      dateCondition = {
        dateDebut: {
          lt: now,
        },
      };
    }
  }

  let queryOptions = {
    where: {
      deleted: false,
      session: dateCondition,
    },
    include: {
      session: {
        include: {
          module: true, // Inclure le module via la session
        },
      },
    },
  };

  // Modifier la requête en fonction de specialAccount
  if (specialAccount === 'true') {
    queryOptions.where.accountId = parseInt(userId); // Utiliser accountId si specialAccount est vrai
  } else {
    queryOptions.where.userId = parseInt(userId); // Utiliser userId sinon
  }

  try {
    // Exécution de la requête en fonction de l'utilisateur ou du compte
    const registrations = specialAccount === 'true' 
      ? await prisma.accountRegistration.findMany(queryOptions) 
      : await prisma.registration.findMany(queryOptions);

    res.json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des modules' });
  }
}
