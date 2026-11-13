const cron = require('node-cron');
const jwt = require('jsonwebtoken');

const TIMEZONE = 'UTC';

const TASKS = [
  {
    name: 'two-weeks-reminder',
    schedule: '0 0 * * *',
    endpoint: '/api/workflow/workflowWeeks',
  },
  {
    name: 'three-days-reminder',
    schedule: '0 0 * * *',
    endpoint: '/api/workflow/workflowDays',
  },
  {
    name: 'one-day-after-reminder',
    schedule: '30 16 * * *',
    endpoint: '/api/workflow/workflowAfter',
  },
  {
    name: 'four-month-after-impact',
    schedule: '30 17 * * *',
    endpoint: '/api/workflow/workflowAfter4Months',
  },
];

// État partagé via `global` pour qu'il soit lisible depuis les routes API Next.js
function getState() {
  if (!global.__cronStatus) {
    global.__cronStatus = {
      enabled: false,
      startedAt: null,
      timezone: TIMEZONE,
      baseUrl: null,
      tasks: {},
    };
  }
  return global.__cronStatus;
}

async function runTask(task, baseUrl) {
  const state = getState();
  const url = `${baseUrl}${task.endpoint}`;
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  console.log(`[cron] ${startedAt} → ${task.name} (${url})`);

  state.tasks[task.name].lastRunStartedAt = startedAt;

  try {
    const fetch = (await import('node-fetch')).default;
    // Même jeton que internalHeaders() de utils/auth.js (module ESM, non
    // chargeable ici) : vérifié par requireInternalOrAdmin.
    const token = jwt.sign({ internal: true }, process.env.JWT_SECRET, { expiresIn: '1m' });
    const res = await fetch(url, { method: 'GET', headers: { 'x-internal-token': token } });
    const text = await res.text();
    const durationMs = Date.now() - t0;
    if (!res.ok) {
      console.error(`[cron] ${task.name} failed (HTTP ${res.status}): ${text}`);
      state.tasks[task.name].lastRunFinishedAt = new Date().toISOString();
      state.tasks[task.name].lastStatus = 'error';
      state.tasks[task.name].lastError = `HTTP ${res.status}: ${text.slice(0, 500)}`;
      state.tasks[task.name].lastDurationMs = durationMs;
    } else {
      console.log(`[cron] ${task.name} ok: ${text}`);
      state.tasks[task.name].lastRunFinishedAt = new Date().toISOString();
      state.tasks[task.name].lastStatus = 'ok';
      state.tasks[task.name].lastError = null;
      state.tasks[task.name].lastResponse = text.slice(0, 500);
      state.tasks[task.name].lastDurationMs = durationMs;
      state.tasks[task.name].runCount = (state.tasks[task.name].runCount || 0) + 1;
    }
  } catch (err) {
    console.error(`[cron] ${task.name} threw:`, err.message);
    state.tasks[task.name].lastRunFinishedAt = new Date().toISOString();
    state.tasks[task.name].lastStatus = 'error';
    state.tasks[task.name].lastError = err.message;
    state.tasks[task.name].lastDurationMs = Date.now() - t0;
  }
}

function startCron({ port }) {
  const state = getState();

  if (process.env.CRON_ENABLED === 'false') {
    console.log('[cron] disabled via CRON_ENABLED=false');
    state.enabled = false;
    return;
  }
  if (process.env.CRON_ENABLED !== 'true' && process.env.NODE_ENV !== 'production') {
    console.log('[cron] disabled (set CRON_ENABLED=true to run in dev)');
    state.enabled = false;
    return;
  }

  const baseUrl = process.env.CRON_BASE_URL || `http://127.0.0.1:${port}`;
  console.log(`[cron] starting ${TASKS.length} scheduled tasks (timezone: ${TIMEZONE}, base: ${baseUrl})`);

  state.enabled = true;
  state.startedAt = new Date().toISOString();
  state.baseUrl = baseUrl;

  for (const task of TASKS) {
    state.tasks[task.name] = {
      schedule: task.schedule,
      endpoint: task.endpoint,
      lastRunStartedAt: null,
      lastRunFinishedAt: null,
      lastStatus: null,
      lastError: null,
      lastResponse: null,
      lastDurationMs: null,
      runCount: 0,
    };

    cron.schedule(
      task.schedule,
      () => { runTask(task, baseUrl); },
      { timezone: TIMEZONE }
    );
    console.log(`[cron] registered "${task.name}" — schedule "${task.schedule}" UTC`);
  }
}

module.exports = { startCron, getState };
