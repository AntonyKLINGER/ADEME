import prisma from '@/lib/prisma'
import { requireAdmin } from '@/utils/auth';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end()

  const { avisList } = req.body

  if (!Array.isArray(avisList)) {
    return res.status(400).json({ error: 'avisList manquant ou invalide' })
  }

  try {
    await prisma.avis.deleteMany()
    await prisma.avis.createMany({
      data: avisList
        .filter(a => a.prenom || a.thematique || a.contenu)
        .map(a => ({
          prenom: a.prenom.trim(),
          thematique: a.thematique.trim(),
          date: new Date(a.date),
          contenu: a.contenu.trim(),
        })),
    })

    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Erreur enregistrement avis:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
