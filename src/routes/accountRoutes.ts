import { Router } from "express";
import { 
    fetchFundingWalletBalance, 
    fetchAccountInformation 
} from "../controllers/accountController";


const router = Router();

router.get("/get-data", fetchFundingWalletBalance);
router.get("/account-info", fetchAccountInformation);

export default router;
