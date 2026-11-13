import fs from 'fs'
import path from 'path'
import { requireAdmin } from '@/utils/auth';

export default function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const { filename } = req.query
  const filePath = path.join(process.cwd(), 'views/emails', filename)

  if (!filename || !/^[\w-]+\.hbs$/.test(filename)) {
    return res.status(400).json({ error: 'Fichier invalide' })
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    res.status(200).json({ content })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lecture du fichier' })
  }
}
