import { Router } from "express";
import {
  fetchZerodhaProfile,
  fetchZerodhaHoldings,
  generateZerodhaToken,
  fetchZerodhaMFHoldings,
  fetchZerodhaMFSIPs,
} from "../controllers/zerodhaController";

const router = Router();

router.get("/profile", fetchZerodhaProfile);
router.get("/holdings", fetchZerodhaHoldings);
router.get("/mf-holdings", fetchZerodhaMFHoldings);
router.get("/mf-sips", fetchZerodhaMFSIPs);
router.post("/generate-token", generateZerodhaToken);

export default router;
