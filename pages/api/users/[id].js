import prisma from '@/prisma'
import { requireActAs, requireAdmin, stripPasswords } from '@/utils/auth';

export default async function handle(req, res) {
  const { id } = req.query;

  if (!(id ? requireActAs(req, res, id, false) : requireAdmin(req, res))) return;

  let queryOptions = {}

  if (id) {
    queryOptions.where = {
      id: parseInt(id),
    };
  }

  const user = await prisma.user.findMany(queryOptions);

  res.json(stripPasswords(user));
}
