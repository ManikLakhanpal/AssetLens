import { Router } from "express";
import { 
    fetchFundingWalletBalance, 
    fetchSpotAccountInfo,
    convertAssetHandler,
    fetchPermissions
} from "../controllers/accountController";


const router = Router();

router.get("/funding-account-data", fetchFundingWalletBalance);
router.get("/spot-account-data", fetchSpotAccountInfo);
router.post("/convert", convertAssetHandler);
router.get("/permissions", fetchPermissions);

export default router;
