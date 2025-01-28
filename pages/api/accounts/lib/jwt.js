import cookie from 'cookie';
import jwt from 'jsonwebtoken';

export default async function handle(req, res) {
    if(req.method === 'POST') {
        const { mail, id, type, regions, modules } = req.body

        const token = jwt.sign(
            { mail: mail, id: id, type: type, regions: regions, modules: modules },
            process.env.JWT_SECRET,
            { expiresIn: '5h' }
        );

        res.setHeader('Set-Cookie', cookie.serialize('auth', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60 * 5,
            path: '/',
            sameSite: 'strict',
        }));

        res.status(200).json({ success: true, message: 'Connexion réussie et cookie créé.' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
