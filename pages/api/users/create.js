import bcrypt from 'bcrypt';
import prisma from '@/prisma';
import fetch from 'node-fetch'
import { internalHeaders, stripPasswords } from '@/utils/auth';

const SALT_ROUNDS = 10;

export default async function handle(req, res) {
    if (req.method === 'POST') {
        // Champs du formulaire d'inscription seulement.
        const { nom, prenom, mail, telephone, motDePasse, fonction, region, organisation, newsletter } = req.body.userData || {};

        if (typeof motDePasse !== 'string' || motDePasse.length < 6) {
            return res.status(400).json({ error: 'Mot de passe trop court' });
        }

        try {
            const userData = {
                nom, prenom, mail, telephone, fonction, region, organisation,
                newsletter: !!newsletter,
                motDePasse: await bcrypt.hash(motDePasse, SALT_ROUNDS),
            };

            const newUser = await prisma.user.create({
                data: userData,
            });

            await fetch(`${process.env.WEBSITE_URL}/api/emails/welcome`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    ...internalHeaders(),
                },
                body: JSON.stringify({
                    prenom: userData.prenom,
                    email: userData.mail
                })
            })

            res.status(201).json(stripPasswords(newUser));
        } catch (error) {
            res.status(500).json({ error: `Impossible de créer le compte: ${error.message}` });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
