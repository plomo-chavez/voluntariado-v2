import express from "express";

import authController from "../controllers/authController.js";

import catalogosDinamicosRoutes from "./catalogosDinamicosRoutes.js";
import catalogosRoutes from "./catalogosRoutes.js";
import delegacionesRoutes from "./delegacionesRoutes.js";
import elementosRoutes from "./elementosRoutes.js";
import logRoutes from "./logRoutes.js";
import reportesRoutes from "./reportesRoutes.js";
import unidadesRoutes from "./unidadesRoutes.js";
import usuariosRoutes from "./usuariosRoutes.js";

const router = express.Router();

// ===== Auth =====
router.post("/api/login", authController.login);
router.post("/api/verificar/:pagina", authController.verificarToken);

// ===== Sub-rutas =====
router.use("/api",usuariosRoutes);
router.use("/api", delegacionesRoutes);
router.use("/api", catalogosRoutes);
router.use("/api", catalogosDinamicosRoutes);
router.use("/api", reportesRoutes);
router.use("/api", elementosRoutes);
router.use("/api", unidadesRoutes);
router.use("/api", logRoutes);
export default router;
