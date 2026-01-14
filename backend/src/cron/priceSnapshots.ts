import { createPriceSnapshots } from "../services/priceSnapshots";

let cronInterval: NodeJS.Timeout | null = null;

// Run price snapshot cron every 5 minutes
const CRON_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function startPriceSnapshotCron(): void {
  console.log("Starting price snapshot cron job...");

  // Run immediately on start
  createPriceSnapshots().catch((error) => {
    console.error("Error in initial price snapshot:", error);
  });

  // Then run every 5 minutes
  cronInterval = setInterval(() => {
    createPriceSnapshots().catch((error) => {
      console.error("Error in price snapshot cron:", error);
    });
  }, CRON_INTERVAL_MS);

  console.log(`Price snapshot cron scheduled to run every ${CRON_INTERVAL_MS / 1000} seconds`);
}

export function stopPriceSnapshotCron(): void {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log("Price snapshot cron stopped");
  }
}

