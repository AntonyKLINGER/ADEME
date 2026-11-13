import prisma from '@/prisma'
import { rateLimit } from '@/utils/rateLimit';

export default async function handle(req, res) {
    // Dit si une adresse a déjà un compte : limité pour freiner l'énumération.
    if (!rateLimit(req, res, 'checkmail', 30, 15 * 60 * 1000)) return;

    const { mail } = req.query;
    if (!mail) {
      return res.status(400).json({ error: 'mail requis' });
    }
  
    let queryOptions = {
      where: {},
    };
  
    if (mail) {
      queryOptions.where.mail = mail;
    }
  
    try {
      const userExist = await prisma.user.findMany(queryOptions);
      if(userExist.length > 0){
        res.json({ exist: true });
      }
      else{
        res.json({ exist: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Une erreur est survenue lors de la requête." });
    }
  }
  
