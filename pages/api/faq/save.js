import prisma from '@/prisma';
import { requireAdmin } from '@/utils/auth';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end()

  const { faqList } = req.body

  if (!faqList || !Array.isArray(faqList)) {
    return res.status(400).json({ error: 'faqList manquant ou invalide' })
  }

  try {
    // Supprime tout si tu veux repartir de zéro (facultatif)
    await prisma.faq.deleteMany()

    await prisma.faq.createMany({
      data: faqList.map(f => ({
        question: f.question,
        reponse: f.reponse
      }))
    })

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Erreur FAQ:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
