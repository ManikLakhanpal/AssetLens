import { Router } from "express";
import {
  fetchZerodhaProfile,
  fetchZerodhaHoldings,
  generateZerodhaToken,
} from "../controllers/zerodhaController";

const router = Router();

router.get("/profile", fetchZerodhaProfile);
router.get("/holdings", fetchZerodhaHoldings);
router.post("/generate-token", generateZerodhaToken);

export default router;
