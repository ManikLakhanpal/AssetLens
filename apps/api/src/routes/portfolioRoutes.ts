import { Router } from "express";
import { fetchBinanceInrValue, fetchPortfolioPieData } from "../controllers/portfolioController";

const router = Router();

router.get("/binance/inr-value", fetchBinanceInrValue);
router.get("/data", fetchPortfolioPieData);

export default router;
