import prisma from '@/prisma';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

function generateUniqueFileName(originalName) {
    const extension = path.extname(originalName); // Extrait l'extension du fichier
    const timestamp = Date.now(); // Génère un timestamp pour l'unicité
    return `${timestamp}${extension}`; // Concatène le timestamp et l'extension pour le nouveau nom
}

export default async function handle(req, res) {
  if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
  }

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      res.status(401).json({ error: 'Unauthorized: Invalid API key' });
      return;
  } 

    const form = new IncomingForm({
        uploadDir: path.join(process.cwd(), '/public/uploads'), // Définir le répertoire de téléchargement
        keepExtensions: true, // Conserver les extensions des fichiers
    });

    // Créez une nouvelle promesse pour traiter le formulaire
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const { moduleId, moduleData: moduleDataJson, metasModuleData: metasModuleDataJson } = data.fields;
    const moduleData = JSON.parse(moduleDataJson);
    const metasModuleData = JSON.parse(metasModuleDataJson);

    try {

      const visuelFile = data.files.visuel;

      let imageUrl = null;
      if (visuelFile) {
            const originalName = visuelFile[0].originalFilename;
            const uniqueFileName = generateUniqueFileName(originalName); // Utilisez la fonction pour générer un nom unique
            const uploadDir = path.join(process.cwd(), '/public/uploads');
            const filePath = path.join(uploadDir, uniqueFileName); // Utilisez le nouveau nom ici
        
            if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
            }
        
            fs.rename(visuelFile[0].filepath, filePath, (err) => {
            if (err) throw err;
            console.log('Fichier déplacé avec succès');
            });
        
            imageUrl = `/uploads/${uniqueFileName}`; // Utilisez le nouveau nom dans l'URL
       }
    

      const now = new Date();
      let slug = moduleData.nom
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,?]/g, "")
      .replace(/\s+/g, '-')
      .toLowerCase()
      
      const updatedModule = await prisma.module.update({
        where: { id: parseInt(moduleId) },
        data: {
          ...moduleData,
          visuel: imageUrl, // Assurez-vous d'avoir une colonne `visuel` dans votre modèle Prisma
          slug: slug,
          lastUpdate: now,
          metasModule: {
            update: {
              ...metasModuleData,
            },
          },
        },
        include: { metasModule: true },
      });

      res.json({updatedModule, visuelData: visuelFile});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}
