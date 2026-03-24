import { Router } from "express";

import { fetchAccountData } from "../controllers/accountController";

const router = Router();

router.get("/get-data", fetchAccountData);

export default router;
