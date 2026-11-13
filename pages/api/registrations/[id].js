import prisma from '@/prisma'
import { requireAdmin } from '@/utils/auth';

export default async function handle(req, res) {
  if (!requireAdmin(req, res)) return;
  const { id } = req.query;

  let queryOptions = {
    include: {
      session: {
        include: {
            module: true
        }
      },
    },
  };

  if (id) {
    queryOptions.where = {
      id: parseInt(id),
    };
  }

  const registration = await prisma.registration.findMany(queryOptions);

  res.json(registration);
}
