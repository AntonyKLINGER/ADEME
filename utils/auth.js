import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded ? decoded : null;
  } catch (err) {
    console.error('Error verifying token:', err);
    return null;
  }
};

// Compte du back-office (table Account, claim `account` posé à la connexion),
// et pas un participant (table User) : les id des deux tables se recouvrent.
export const isAdmin = (user) =>
  !!user && user.account === true &&
  (user.id == 10 || user.type == 'Administrateur' || user.type == 'DR');

// Pour les routes API d'administration : vérifie la session (cookie httpOnly
// `auth`), répond 401 sinon. Renvoie l'utilisateur, ou null si la réponse est
// déjà envoyée.
export const requireAdmin = (req, res) => {
  const user = req.cookies.auth ? verifyToken(req.cookies.auth) : null;
  if (!isAdmin(user)) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
};
