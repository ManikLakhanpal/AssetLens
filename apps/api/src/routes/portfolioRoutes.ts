import { Router } from "express";
import {
  fetchBinanceInrValue,
  fetchPortfolioSummary,
} from "../controllers/portfolioController";

const router = Router();

router.get("/binance/inr-value", fetchBinanceInrValue);
router.get("/portfolio/summary", fetchPortfolioSummary);

export default router;
