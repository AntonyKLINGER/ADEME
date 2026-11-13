import bcrypt from 'bcrypt';
import prisma from '@/prisma';
import { requireActAs, stripPasswords } from '@/utils/auth';

const SALT_ROUNDS = 10;

export default async function handle(req, res) {
    if (req.method === 'POST') {
        const { motDePasse, ancienMotDePasse, userId, type } = req.body;

        if (!requireActAs(req, res, userId, type == "special")) return;

        if (typeof motDePasse !== 'string' || motDePasse.length < 6) {
            return res.status(400).json({ error: 'Le mot de passe est trop court' });
        }

        try {
            // Le mot de passe actuel est exigé : une session volée ou laissée
            // ouverte ne suffit pas à prendre le compte.
            const current = type == "special"
                ? (await prisma.account.findUnique({ where: { id: parseInt(userId) } }))?.password
                : (await prisma.user.findUnique({ where: { id: parseInt(userId) } }))?.motDePasse;
            if (!current || typeof ancienMotDePasse !== 'string' || !(await bcrypt.compare(ancienMotDePasse, current))) {
                return res.status(403).json({ error: 'Mot de passe actuel incorrect' });
            }

            const hashedPassword = await bcrypt.hash(motDePasse, SALT_ROUNDS);

            if(type == "special"){
                const updatedUser = await prisma.account.update({
                    where: { id: parseInt(userId) },
                    data: {
                        password: hashedPassword
                    },
                });
    
                res.json(stripPasswords(updatedUser));
            } else {
                const updatedUser = await prisma.user.update({
                    where: { id: parseInt(userId) },
                    data: {
                        motDePasse: hashedPassword
                    },
                });
    
                res.json(stripPasswords(updatedUser));
            }
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Impossible de modifier le mot de passe' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
