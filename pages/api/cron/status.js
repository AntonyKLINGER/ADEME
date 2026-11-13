import { requireAdmin } from '@/utils/auth';

export default function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  const status = global.__cronStatus || {
    enabled: false,
    startedAt: null,
    timezone: null,
    baseUrl: null,
    tasks: {},
    note: "Le scheduler n'a pas encore été initialisé dans ce process.",
  };

  res.status(200).json({
    now: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || null,
    cronEnabledEnv: process.env.CRON_ENABLED || null,
    ...status,
  });
}
