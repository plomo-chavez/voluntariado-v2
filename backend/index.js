// ===============================
// CARGA DE VARIABLES DE ENTORNO
// ===============================
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ===============================
// RUTAS BASE
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determina entorno
const isProd = process.env.NODE_ENV === "production";

// Seleccionar archivo env
const envPath = isProd
  ? path.resolve(__dirname, "../config/.env.backend.prod")
  : path.resolve(__dirname, "../config/.env.backend");

// Cargar variables
dotenv.config({ path: envPath });

console.log("Backend env cargado desde:", envPath);
console.log("NODE_ENV:", process.env.NODE_ENV);

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

// ===============================
// START SERVER (HTTP)
// ===============================
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Backend escuchando en http://localhost:${port}`);
});
