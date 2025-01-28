import prisma from '@/prisma';

export default async function handle(req, res) {
  const { sessionId } = req.query;

  const parsedSessionId = parseInt(sessionId);

  try {
    // Requête pour récupérer les reviews des utilisateurs
    const userReviews = await prisma.review.findMany({
      where: {
        sessionId: parsedSessionId,
      },
      include: {
        user: true, // Inclure les informations de l'utilisateur
      },
    });

    // Requête pour récupérer les reviews des comptes spéciaux
    const accountReviews = await prisma.accountReview.findMany({
      where: {
        sessionId: parsedSessionId,
      },
      include: {
        account: true, // Inclure les informations du compte
      },
    });

    // Combiner les deux résultats
    const combinedReviews = [
      ...userReviews.map((review) => ({
        ...review,
        type: 'userReview', // Indiquer qu'il s'agit d'une review d'utilisateur
      })),
      ...accountReviews.map((review) => ({
        ...review,
        type: 'accountReview', // Indiquer qu'il s'agit d'une review de compte
      })),
    ];

    res.json(combinedReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des reviews' });
  }
}
