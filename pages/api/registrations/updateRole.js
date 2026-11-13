import prisma from '@/lib/prisma';
import { requireAdmin } from '@/utils/auth';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { registrationId, role, type } = req.body;

  if (!registrationId || !role) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  try {

    let updated

    if(type == "user"){
        updated = await prisma.registration.update({
            where: { id: registrationId },
            data: { role },
        });
    } else {
        updated = await prisma.accountRegistration.update({
            where: { id: registrationId },
            data: { role },
        });
    }
 
    res.status(200).json({ success: true, registration: updated });
  } catch (error) {
    console.error('Erreur update role:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
