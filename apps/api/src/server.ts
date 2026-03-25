import express from "express";
import cors from "cors";
import accountRoutes from "./routes/accountRoutes";
import zerodhaRoutes from "./routes/zerodhaRoutes";
import portfolioRoutes from "./routes/portfolioRoutes";

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// * Routes
app.use(accountRoutes);
app.use(zerodhaRoutes);
app.use(portfolioRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
