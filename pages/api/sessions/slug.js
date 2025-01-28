import prisma from '@/prisma';

// Liste des slugs de régions
const regionSlugs = {
  'auvergne-rhone-alpes': 'Auvergne-Rhône-Alpes',
  'bourgogne-franche-comte': 'Bourgogne-Franche-Comté',
  'bretagne': 'Bretagne',
  'centre-val-de-loire': 'Centre-Val de Loire',
  'corse': 'Corse',
  'grand-est': 'Grand-Est',
  'hauts-de-france': 'Hauts-de-France',
  'ile-de-france': 'Île-de-France',
  'normandie': 'Normandie',
  'nouvelle-aquitaine': 'Nouvelle-Aquitaine',
  'occitanie': 'Occitanie',
  'pays-de-la-loire': 'Pays de la Loire',
  'guyane': 'Guyane',
  'martinique': 'Martinique',
  'la-reunion': 'La Reunion',
  'guadeloupe': 'Guadeloupe',
  'mayotte': 'Mayotte',
  'polynesie-francaise': 'Polynésie Française',
  'provence-alpes-cote-d-azur': 'Provence-Alpes-Côte d\'Azur',
  'saint-pierre-et-miquelon': 'Saint-Pierre et Miquelon',
  'ocean-indien': 'Océan Indien',
  'nouvelle-caledonie': "Nouvelle Calédonie",
  'provence-alpes-cote-dazur': 'Provence-Alpes-Côte d\'Azur'
};

export default async function handle(req, res) {
  const { session } = req.query;

  // Extraire les composants du slug
  const components = session.split('-');
  const dateParts = components.slice(1, 4); 
  const regionSlug = components.slice(4).join('-'); 

  const dateDebut = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
  const region = regionSlugs[regionSlug]; 

  if (!region) {
    return res.status(404).json({ message: "Région non trouvée ou format de slug incorrect" });
  }

  try {
    const sessionData = await prisma.session.findMany({
      where: {
        dateDebut: dateDebut,
        region: region,
      },
      include: {
        module: {
          include: {
            metasModule: true,
          },
        },
        metasSession: true
      },
    });

    if (sessionData.length === 0) {
      return res.status(404).json({ message: "Session non trouvée pour la région et la date spécifiées" });
    }

    res.json(sessionData);
  } catch (error) {
    console.error("Erreur lors de la récupération de la session :", error.message);
    res.status(500).json({ error: "Impossible de récupérer les données de la session" });
  }
}
