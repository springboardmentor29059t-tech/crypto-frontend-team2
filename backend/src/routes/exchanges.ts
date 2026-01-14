import { Router } from "express";
import { z } from "zod";
import { exchanges as seedExchanges } from "../data/mockData";

const router = Router();
const exchanges = [...seedExchanges];

const connectSchema = z.object({
  id: z.string(),
  apiKey: z.string().min(10),
  apiSecret: z.string().min(10),
});

router.get("/", (_req, res) => {
  res.json({ items: exchanges });
});

router.post("/connect", (req, res) => {
  const parse = connectSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }

  const { id } = parse.data;
  const exchange = exchanges.find((e) => e.id === id);
  if (!exchange) {
    return res.status(404).json({ error: "Exchange not found" });
  }

  exchange.connected = true;
  exchange.status = "healthy";
  exchange.lastSync = "just now";

  res.json({ message: "Exchange connected", exchange });
});

router.post("/disconnect/:id", (req, res) => {
  const exchange = exchanges.find((e) => e.id === req.params.id);
  if (!exchange) {
    return res.status(404).json({ error: "Exchange not found" });
  }

  exchange.connected = false;
  exchange.status = "disconnected";
  exchange.lastSync = null;
  exchange.assets = 0;
  exchange.value = 0;

  res.json({ message: "Exchange disconnected", exchange });
});

export default router;

