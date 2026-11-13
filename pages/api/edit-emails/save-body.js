import fs from 'fs'
import path from 'path'
import { requireAdmin } from '@/utils/auth';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end()

  const { filename, newBodyHtml } = req.body

  if (!filename || !/^[\w-]+\.hbs$/.test(filename)) {
    return res.status(400).json({ error: 'Nom de fichier invalide' })
  }

  const filePath = path.join(process.cwd(), 'views/emails', filename)

  try {
    const original = fs.readFileSync(filePath, 'utf-8')

    // Remplacer le contenu de <div class="text">...</div>
    const updated = original.replace(
      /<div class="text">([\s\S]*?)<\/div>/,
      `<div class="text">\n${newBodyHtml}\n</div>`
    )

    fs.writeFileSync(filePath, updated, 'utf-8')

    res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur sauvegarde' })
  }
}
