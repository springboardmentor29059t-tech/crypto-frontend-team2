import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import holdingsRoutes from "./routes/holdings";
import tradesRoutes from "./routes/trades";
import alertsRoutes from "./routes/alerts";
import exchangesRoutes from "./routes/exchanges";
import settingsRoutes from "./routes/settings";
import pricesRoutes from "./routes/prices";
import riskRoutes from "./routes/risk";
import notificationsRoutes from "./routes/notifications";
import { requireAuth } from "./utils/auth";
import { startPriceSnapshotCron } from "./cron/priceSnapshots";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "crypto-guardian-backend", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/holdings", requireAuth, holdingsRoutes);
app.use("/trades", requireAuth, tradesRoutes);
app.use("/alerts", requireAuth, alertsRoutes);
app.use("/exchanges", requireAuth, exchangesRoutes);
app.use("/settings", requireAuth, settingsRoutes);
app.use("/prices", pricesRoutes);
app.use("/risk", requireAuth, riskRoutes);
app.use("/notifications", requireAuth, notificationsRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  // Start price snapshot cron job
  startPriceSnapshotCron();
});

