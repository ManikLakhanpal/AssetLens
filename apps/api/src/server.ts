import express from "express";
import accountRoutes from "./routes/accountRoutes";

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(accountRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
