import cookie from 'cookie';
import jwt from 'jsonwebtoken';

// Pose le cookie de session. Les claims viennent toujours de la base, après
// vérification du mot de passe : jamais du corps de la requête.
export const setSessionCookie = (res, claims) => {
    const token = jwt.sign(claims, process.env.JWT_SECRET, { expiresIn: '5h' });

    res.setHeader('Set-Cookie', cookie.serialize('auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60 * 5,
        path: '/',
        sameSite: 'strict',
    }));
};
