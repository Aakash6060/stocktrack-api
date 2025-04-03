import express from "express";
import morgan from "morgan";
import cors from "cors";
import { Request, Response } from "express";
import authRoutes from "./api/v1/routes/auth";
import stockRoutes from "./api/v1/routes/stock";

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/stocks", stockRoutes);

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to StockTrack API");
  });
export default app;