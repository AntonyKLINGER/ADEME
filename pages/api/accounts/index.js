import prisma from '@/prisma'
import { requireAdmin, stripPasswords } from '@/utils/auth';

export default async function handle(req, res) {
  if (!requireAdmin(req, res)) return;

  let queryOptions = {}

  const accounts = await prisma.account.findMany({
    orderBy: {
      type: 'asc',
    },
  });
  

  res.json(stripPasswords(accounts));
}
