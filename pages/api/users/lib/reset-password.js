import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '@/prisma';
import fetch from 'node-fetch';
import { internalHeaders } from '@/utils/auth';
import { passwordFingerprint, readResetToken } from '@/utils/session';

function generatePassword(length = 10) {
    return crypto.randomBytes(length)
        .toString('base64')
        .replace(/\+/g, '0')
        .replace(/\//g, '0')
        .substring(0, length);
}

const SALT_ROUNDS = 10;

// Ouvert depuis le lien de l'email (forgot-password.js) : génère un nouveau
// mot de passe, l'envoie par email, puis renvoie vers la page de connexion.
export default async function handle(req, res) {
    const payload = readResetToken(req.query.token);
    const record = payload && (payload.account
        ? await prisma.account.findUnique({ where: { id: payload.id } })
        : await prisma.user.findUnique({ where: { id: payload.id } }));
    const currentHash = record && (payload.account ? record.password : record.motDePasse);

    // Jeton expiré, forgé, ou déjà utilisé (le hash a changé depuis).
    if (!record || payload.fp !== passwordFingerprint(currentHash)) {
        return res.redirect(302, '/connexion?reset=invalide');
    }

    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    if (payload.account) {
        await prisma.account.update({ where: { id: record.id }, data: { password: hashedPassword } });
    } else {
        await prisma.user.update({ where: { id: record.id }, data: { motDePasse: hashedPassword } });
    }

    await fetch(`${process.env.WEBSITE_URL}/api/emails/newPassword`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            ...internalHeaders(),
        },
        body: JSON.stringify({
            email: payload.account ? record.email : record.mail,
            password: newPassword,
        })
    });

    return res.redirect(302, '/connexion?reset=ok');
}
