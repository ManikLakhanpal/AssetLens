import { Router } from "express";
import {
  fetchBinanceInrValue,
  fetchPortfolioSummary,
  fetchPortfolioAssets,
} from "../controllers/portfolioController";

const router = Router();

router.get("/binance/inr-value", fetchBinanceInrValue);
router.get("/portfolio/summary", fetchPortfolioSummary);
router.get("/portfolio/assets", fetchPortfolioAssets);

export default router;
