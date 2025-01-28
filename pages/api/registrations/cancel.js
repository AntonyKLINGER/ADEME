import prisma from '@/prisma';

export default async function handle(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const { userId, sessionId, type } = req.body;

    if (!userId || !sessionId) {
        return res.status(400).send("userId et sessionId sont requis.");
    }

    // Convertir et valider les identifiants comme des entiers
    const parsedUserId = parseInt(userId, 10);
    const parsedSessionId = parseInt(sessionId, 10);

    if (isNaN(parsedUserId) || isNaN(parsedSessionId)) {
        return res.status(400).send("userId et sessionId doivent être des entiers valides.");
    }

    try {
        let registration;
        if (type === 'special') {
            // Recherche et suppression dans accountRegistration
            registration = await prisma.accountRegistration.findFirst({
                where: {
                    accountId: parsedUserId,
                    sessionId: parsedSessionId
                }
            });

            if (registration) {
                const updatedRegistration = await prisma.accountRegistration.update({
                    where: {
                        id: registration.id
                    },
                    data: {
                        deleted: true
                    }
                });
                res.json(updatedRegistration);
            } else {
                res.status(404).send("Account registration not found.");
            }
        } else {
            // Recherche et suppression dans registration
            registration = await prisma.registration.findFirst({
                where: {
                    userId: parsedUserId,
                    sessionId: parsedSessionId
                }
            });

            if (registration) {
                const updatedRegistration = await prisma.registration.update({
                    where: {
                        id: registration.id
                    },
                    data: {
                        deleted: true
                    }
                });
                res.json(updatedRegistration);
            } else {
                res.status(404).send("Registration not found.");
            }
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la session:", error.message);
        res.status(500).json({ error: "Une erreur interne est survenue" });
    }
}
