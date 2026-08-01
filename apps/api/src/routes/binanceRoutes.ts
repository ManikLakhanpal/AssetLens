import { Router } from "express";
import { 
    fetchFundingWalletBalance, 
    fetchSpotAccountInfo,
    convertAssetHandler,
    fetchPermissions,
    transferAssetHandler
} from "../controllers/accountController.js";


const router = Router();

router.get("/funding-account-data", fetchFundingWalletBalance);
router.get("/spot-account-data", fetchSpotAccountInfo);
router.post("/convert", convertAssetHandler);
router.get("/permissions", fetchPermissions);
router.post("/transfer", transferAssetHandler);

export default router;
