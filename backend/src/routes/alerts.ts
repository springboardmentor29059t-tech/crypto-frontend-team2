import { Router } from "express";
import { alerts } from "../data/mockData";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ items: alerts });
});

export default router;

