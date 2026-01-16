import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import healthRouter from "./routes/health.js";
import configRouter from "./routes/config.js";
import datasetsRouter from "./routes/datasets.js";
import evaluationRouter from "./routes/evaluation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", configRouter);
app.use("/api", datasetsRouter);
app.use("/api", evaluationRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
