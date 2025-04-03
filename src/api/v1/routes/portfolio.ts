// src/api/v1/routes/portfolio.ts
import { Router } from "express";
import { addStockToPortfolio } from "../controllers/portfolioController";
import { verifyRole } from "../../../middleware/auth"; // Assuming role-based middleware

const router = Router();

// Add stock to portfolio (only accessible to authenticated users)
router.post("/add", verifyRole(["Investor"]), addStockToPortfolio);

export default router;
