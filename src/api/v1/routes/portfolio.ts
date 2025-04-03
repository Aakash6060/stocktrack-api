// src/api/v1/routes/portfolio.ts
import { Router } from "express";
import { addStockToPortfolio } from "../controllers/portfolioController";

const router = Router();

// Add stock to portfolio (no authentication for now)
router.post("/add-stock", addStockToPortfolio);

export default router;
