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

// Session lue dans le cookie httpOnly `auth`, ou null. Un jeton d'appel
// interne n'est jamais une session.
export const getSession = (req) => {
  const session = req.cookies.auth ? verifyToken(req.cookies.auth) : null;
  return session && !session.internal ? session : null;
};

// Compte du back-office (table Account, claim `account` posé à la connexion),
// et pas un participant (table User) : les id des deux tables se recouvrent.
export const isAdmin = (user) =>
  !!user && user.account === true &&
  (user.id == 10 || user.type == 'Administrateur' || user.type == 'DR');

// Admin, ou la session elle-même : même id ET même table (`special` = Account).
// L'id doit être un entier décimal canonique : les routes le relisent avec
// parseInt, qui ne lit pas « 1e1 » ou « 0x5 » comme Number/== (10, 5).
export const canActAs = (session, id, special) =>
  isAdmin(session) ||
  (!!session && /^\d+$/.test(String(id)) && session.id === Number(id) && !!session.account === !!special);

// Borne de pointage de pages/presence.js : participant (table User) id 115.
export const isPresenceKiosk = (session) =>
  !!session && !session.account && session.id == 115;

// Retire les mots de passe (Account.password, User.motDePasse) à toute
// profondeur d'une réponse.
export const stripPasswords = (data) =>
  JSON.parse(JSON.stringify(data, (key, value) =>
    key === 'password' || key === 'motDePasse' ? undefined : value));

// Les require* répondent 401/403 et renvoient null si la réponse est déjà
// envoyée, la session sinon.
export const requireSession = (req, res) => {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return session;
};

export const requireAdmin = (req, res) => {
  const user = getSession(req);
  if (!isAdmin(user)) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
};

export const requireActAs = (req, res, id, special) => {
  const session = requireSession(req, res);
  if (!session) return null;
  if (!canActAs(session, id, special)) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return session;
};

// Appels serveur à serveur (cron, routes API qui appellent /api/emails/*) :
// jeton court signé avec JWT_SECRET, envoyé dans un en-tête.
const INTERNAL_HEADER = 'x-internal-token';

export const internalHeaders = () => ({
  [INTERNAL_HEADER]: jwt.sign({ internal: true }, process.env.JWT_SECRET, { expiresIn: '1m' }),
});

export const requireInternalOrAdmin = (req, res) => {
  const token = req.headers[INTERNAL_HEADER];
  const decoded = typeof token === 'string' ? verifyToken(token) : null;
  if (decoded && decoded.internal === true) return decoded;
  return requireAdmin(req, res);
};
