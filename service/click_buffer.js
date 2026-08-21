import * as models from "../models/models.js";

// Redirects are the hot path, so clicks are aggregated in memory and flushed
// periodically instead of issuing one UPDATE per request. This also removes the
// row-lock contention a single hot short URL used to create.

const FLUSH_INTERVAL_MS = Number(process.env.CLICK_FLUSH_INTERVAL_MS) || 5000;

let aPending = new Map();
let bFlushing = false;

function record(iUrlId) {
  aPending.set(iUrlId, (aPending.get(iUrlId) ?? 0) + 1);
}

async function flush() {

  if (bFlushing || aPending.size === 0) {
    return;
  }

  bFlushing = true;

  const aBatch = aPending;
  aPending = new Map();

  try {
    await models.incrementClickCounts(aBatch);
  } catch (error) {
    console.error('Error flushing click counts:', error);

    // Put the counts back so they are retried on the next flush.
    for (const [iUrlId, iCount] of aBatch) {
      aPending.set(iUrlId, (aPending.get(iUrlId) ?? 0) + iCount);
    }
  } finally {
    bFlushing = false;
  }
}

const timer = setInterval(flush, FLUSH_INTERVAL_MS);

// Don't hold the process open just for the flush timer.
timer.unref();

// Best-effort flush so counts buffered at shutdown aren't lost.
for (const sSignal of ['SIGINT', 'SIGTERM']) {
  process.once(sSignal, async () => {
    clearInterval(timer);
    await flush();
    process.exit(0);
  });
}

export {
  record,
  flush
}
