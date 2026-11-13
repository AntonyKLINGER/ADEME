import fs from 'fs'
import path from 'path'
import { requireAdmin } from '@/utils/auth';

export default function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const { filename } = req.query
  const filePath = path.join(process.cwd(), 'views/emails', filename)

  if (!filename || !/^[\w-]+\.hbs$/.test(filename)) {
    return res.status(400).json({ error: 'Nom de fichier invalide' })
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // Extraction de <div class="text">...</div>
    const match = content.match(/<div class="text">([\s\S]*?)<\/div>/)
    const extracted = match ? match[1] : ''

    res.status(200).json({ fullHtml: content, bodyHtml: extracted })
  } catch (err) {
    res.status(500).json({ error: 'Erreur lecture fichier' })
  }
}
