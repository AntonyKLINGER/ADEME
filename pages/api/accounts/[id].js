import prisma from '@/prisma'

export default async function handle(req, res) {
  const { id } = req.query;

  let queryOptions = {}

  if (id) {
    queryOptions.where = {
      id: parseInt(id),
    };
  }

  const user = await prisma.account.findMany(queryOptions);

  res.json(user);
}
