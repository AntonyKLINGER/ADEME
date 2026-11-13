import prisma from '@/prisma'
import { requireActAs } from '@/utils/auth';

export default async function handle(req, res) {
  const { userId, sessionId, specialAccount } = req.query;

  if (!requireActAs(req, res, userId, specialAccount)) return;
  // Sans sessionId, la requête renverrait toutes les reviews.
  if (!sessionId) return res.status(400).json({ error: 'sessionId requis' });

  let queryOptions = {};

  if(specialAccount){

    if (userId && sessionId) {
      queryOptions.where = {
        accountId: parseInt(userId),
        sessionId: parseInt(sessionId)
      };
    }
  
    const review = await prisma.accountReview.findMany(queryOptions);
  
    res.json(review);
    
  } else {

    if (userId && sessionId) {
      queryOptions.where = {
        userId: parseInt(userId),
        sessionId: parseInt(sessionId)
      };
    }
  
    const review = await prisma.review.findMany(queryOptions);
  
    res.json(review);

  }

}
