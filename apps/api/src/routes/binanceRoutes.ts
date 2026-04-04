import { Router } from "express";
import { 
    fetchFundingWalletBalance, 
    fetchSpotAccountInfo 
} from "../controllers/accountController";


const router = Router();

router.get("/get-data", fetchFundingWalletBalance);
router.get("/account-info", fetchSpotAccountInfo);

export default router;
