import { Router } from "express";
import { 
    fetchFundingWalletBalance, 
    fetchSpotAccountInfo 
} from "../controllers/accountController";


const router = Router();

router.get("/funding-account-data", fetchFundingWalletBalance);
router.get("/spot-account-data", fetchSpotAccountInfo);

export default router;
