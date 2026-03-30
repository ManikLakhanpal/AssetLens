import express from "express";
import cors from "cors";
import binanceRoutes from "./routes/binanceRoutes";
import zerodhaRoutes from "./routes/zerodhaRoutes";
import portfolioRoutes from "./routes/portfolioRoutes";
import aiRoutes from "./routes/aiRoutes";

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// * Routes
app.use('/binance/', binanceRoutes);
app.use('/zerodha/', zerodhaRoutes);
app.use('/portfolio/', portfolioRoutes);
app.use('/ai/', aiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
