// ===============================
// CARGA DE VARIABLES DE ENTORNO
// ===============================
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const isProductionArg = process.argv.includes("production");

// ===============================
// RUTAS BASE
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.NODE_ENV =
  process.env.NODE_ENV || (isProductionArg ? "production" : "development");

process.env.IS_PROD =
  process.env.IS_PROD ||
  (process.env.NODE_ENV === "production" ? "true" : "false");

const isProd = process.env.NODE_ENV === "production";
const envPath = isProd
  ? path.resolve(__dirname, "../config/.env.backend.prod")
  : path.resolve(__dirname, "../config/.env.backend");

// Cargar variables
dotenv.config({ path: envPath });

console.log("Backend NODE_ENV:", process.env.NODE_ENV);

// ===============================
// IMPORTS
// ===============================
import cors from "cors";
import express from "express";
import apisRoutes from "./routes/apisRoutes.js";

// ===============================
// APP
// ===============================
const app = express();
const port = process.env.PORT || 3000;

// ===============================
// MIDDLEWARES
// ===============================
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ===============================
// ROUTES
// ===============================
app.use(apisRoutes);

// ===============================
// STATIC FILES
// ===============================
app.use("/files", express.static(path.join(__dirname, "files")));
// Servir archivos subidos y assets (expedientes, plantillas, tmp, etc.)
app.use("/assets", express.static(path.join(__dirname, "assets")));

// ===============================
// START SERVER (HTTP)
// ===============================
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Backend escuchando en http://localhost:${port}`);
});
