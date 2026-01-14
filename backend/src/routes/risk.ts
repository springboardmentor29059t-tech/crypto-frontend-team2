import { Router } from "express";
import { checkContractReputation } from "../services/riskAlerts";
import { AuthedRequest } from "../utils/auth";

const router = Router();

// Check contract reputation
router.post("/check", async (req: AuthedRequest, res) => {
  try {
    const { address, symbol } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const reputation = await checkContractReputation(
      address,
      symbol || "UNKNOWN"
    );
    res.json(reputation);
  } catch (error) {
    console.error("Error checking contract reputation:", error);
    res.status(500).json({ error: "Failed to check contract reputation" });
  }
});

export default router;

