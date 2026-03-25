import { Router } from "express";
import {
  fetchZerodhaProfile,
  fetchZerodhaHoldings,
  generateZerodhaToken,
} from "../controllers/zerodhaController";

const router = Router();

router.get("/zerodha/profile", fetchZerodhaProfile);
router.get("/zerodha/holdings", fetchZerodhaHoldings);
router.post("/zerodha/generate-token", generateZerodhaToken);

export default router;
