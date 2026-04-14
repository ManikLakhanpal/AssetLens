import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import binanceRoutes from "./routes/binanceRoutes.js";
import zerodhaRoutes from "./routes/zerodhaRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// * Public routes
app.use("/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "OK" });
});

// * Protected routes
app.use(authMiddleware);
app.use("/binance", binanceRoutes);
app.use("/zerodha", zerodhaRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
