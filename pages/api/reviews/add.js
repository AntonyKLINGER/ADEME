import prisma from '@/prisma'

export default async function handle(req, res) {
    // Vérifier que la méthode utilisée est POST
    if (req.method !== 'POST') {
        // Informer le client que seule la méthode POST est autorisée
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Extraire les données reçues du corps de la requête
    const { note, commentaire, userId, sessionId, type } = req.body;

    // Valider les données reçues
    if (!note || !commentaire || !userId || !sessionId) {
        // Retourner une erreur si une des données obligatoires est manquante
        return res.status(400).json({ error: 'Les champs note, commentaire, userId et sessionId sont obligatoires.' });
    }

    try {
        let newReview;

        if (type === 'special') {
            // Créer une nouvelle review dans AccountReview si le type est "special"
            newReview = await prisma.accountReview.create({
                data: {
                    note,
                    commentaire,
                    accountId: userId, // Utiliser accountId au lieu de userId
                    sessionId
                }
            });
        } else {
            // Créer une nouvelle review dans Review pour tous les autres types
            newReview = await prisma.review.create({
                data: {
                    note,
                    commentaire,
                    userId,
                    sessionId
                }
            });
        }

        // Retourner la review créée
        res.status(201).json(newReview);
    } catch (error) {
        // Gérer les erreurs potentielles, par exemple les contraintes de clé étrangère
        res.status(500).json({ error: `Impossible de créer la review : ${error.message}` });
    }
}
