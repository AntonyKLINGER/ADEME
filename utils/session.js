import crypto from 'crypto';
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

// --- Lien de réinitialisation du mot de passe ---
//
// Secret dérivé : un jeton de réinitialisation ne vaut jamais session (cookie
// `auth`) ni appel interne. Il porte une empreinte du hash actuel du mot de
// passe : il ne sert qu'une fois, puisque la réinitialisation change ce hash.
const resetSecret = () => `${process.env.JWT_SECRET}:reset-password`;

export const passwordFingerprint = (hash) =>
    crypto.createHash('sha256').update(hash || '').digest('hex').slice(0, 16);

export const signResetToken = ({ id, account, hash }) =>
    jwt.sign({ id, account, fp: passwordFingerprint(hash) }, resetSecret(), { expiresIn: '1h' });

export const readResetToken = (token) => {
    try {
        return typeof token === 'string' ? jwt.verify(token, resetSecret()) : null;
    } catch {
        return null;
    }
};
