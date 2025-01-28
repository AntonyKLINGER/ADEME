import prisma from '@/prisma';

export default async function handle(req, res) {
 
  const { id, telephone, fonction, organisation, region } = req.body; // Les nouvelles informations envoyées par le client

  if (!id) {
    return res.status(400).json({ error: 'L\'ID de l\'utilisateur est requis' });
  }

  try {
    // Recherche de l'utilisateur existant par son ID
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Préparation de l'objet de mise à jour, en comparant les nouvelles informations
    const updatedData = {};

    if (organisation && organisation !== user.organisation) {
      updatedData.organisation = organisation;
    }
    if (region && region !== user.region) {
      updatedData.region = region;
    }
    if (telephone && telephone !== user.telephone) {
      updatedData.telephone = telephone;
    }
    if (fonction && fonction !== user.fonction) {
      updatedData.fonction = fonction;
    }

    // Si aucune donnée n'est à mettre à jour
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: 'Aucune modification détectée' });
    }

    // Mise à jour de l'utilisateur dans la base de données
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: updatedData,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur du serveur' });
  }
}
