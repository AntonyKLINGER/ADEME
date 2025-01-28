import prisma from '@/prisma'

export default async function handle(req, res) {
  const { userId, sessionId, specialAccount } = req.query;

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
