import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Zestr Learning API" });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Learning server running on port ${PORT}`));
