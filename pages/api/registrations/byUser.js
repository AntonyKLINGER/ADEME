import prisma from '@/prisma';

export default async function handle(req, res) {
  const { userId, status } = req.query;

  let dateCondition = {};
  let now = new Date()

//   if(status){
//     // ajouter conditions si session.dateDebut < now ou non
//     if(status == 'upcoming'){
//         dateCondition = {
//             dateDebut: {
//                 gt: now,
//             },
//         };
//     }
//     if(status == 'old'){
//         dateCondition = {
//             dateDebut: {
//                 lt: now,
//             },
//         };
//     }
//   }

  let queryOptions = {
    where: {
        userId: parseInt(userId),
    },
    include: {
        // user: true,
        session: {
            where: true
        }
    },
  };


  try {
    const registrations = await prisma.registration.findMany(queryOptions);
    res.json(registrations); // Retourner tous les modules, y compris ceux sans sessions
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des modules' });
  }
}
