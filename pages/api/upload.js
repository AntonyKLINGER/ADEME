import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabaseUrl = "https://eazuwwpllqueujyivlce.supabase.co"; //process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const uploadDir = path.resolve('/tmp/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      multiples: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ files });
    });
  }).catch(err => {
    console.error(err);
    res.status(500).json({ error: `Erreur lors de l'analyse du formulaire: ${err.message}` });
    return;
  });

  if (!data) return;

  const urlsPDF = [];

  for (const fileArray of Object.values(data.files)) {
    const files = Array.isArray(fileArray) ? fileArray : [fileArray];
    for (const file of files) {
      // Normalisation et sécurisation du nom de fichier
      const safeFilename = file.originalFilename
        .normalize('NFC') // Normalisation UTF-8
        .replace(/[^a-zA-Z0-9_.-]/g, '_'); // Remplace les caractères spéciaux
      const uploadFilename = `uploads/${safeFilename}`;

      try {
        // Vérification si le fichier existe déjà dans Supabase
        const { data: existingFiles, error: listError } = await supabase
          .storage
          .from('ademe')
          .list('uploads', {
            search: safeFilename,
          });

        if (listError) {
          console.error('Erreur lors de la vérification de l\'existence du fichier sur Supabase:', listError);
          continue;
        }

        let finalFilename = uploadFilename;
        if (existingFiles && existingFiles.length > 0) {
          const timestamp = Date.now();
          finalFilename = `uploads/${timestamp}_${safeFilename}`;
        }

        // Lecture et upload du fichier
        const fileBuffer = fs.readFileSync(file.filepath);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ademe')
          .upload(finalFilename, fileBuffer, {
            contentType: file.mimetype,
          });

        if (uploadError) {
          console.error('Erreur lors de l\'upload sur Supabase:', uploadError);
          continue;
        }

        // Récupération de l'URL publique
        const { data: publicURL, error: urlError } = await supabase.storage
          .from('ademe')
          .getPublicUrl(finalFilename);

        if (urlError) {
          console.error('Erreur lors de la récupération de l\'URL publique sur Supabase:', urlError);
          continue;
        }

        console.log('Public URL:', publicURL);

        urlsPDF.push({
          nom: file.originalFilename,
          url: publicURL.publicUrl,
        });
      } catch (error) {
        console.error('Erreur générale lors du traitement du fichier:', error);
      }
    }
  }

  res.status(200).json({ urlsPDF, env1: supabaseUrl });
}
