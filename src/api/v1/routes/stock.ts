import { Router } from "express";
import { getStockData } from "../controllers/stockController";

const router = Router();

router.get("/:symbol", getStockData);

export default router;
