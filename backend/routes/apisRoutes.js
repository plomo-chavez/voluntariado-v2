import express from "express";

import authController from "../controllers/authController.js";
import logRequestMiddleware from "../middleware/logRequestMiddleware.js";

import catalogosController from "../controllers/catalogosController.js";
import elementosController from "../controllers/elementosController.js";
import catalogosDinamicosRoutes from "./catalogosDinamicosRoutes.js";
import catalogosRoutes from "./catalogosRoutes.js";
import elementosRoutes from "./elementosRoutes.js";
import logRoutes from "./logRoutes.js";
import pagesRoutes from "./pagesRoutes.js";
import usuariosRoutes from "./usuariosRoutes.js";

const router = express.Router();

// Middleware para loguear todas las peticiones
router.use(logRequestMiddleware);

// ===== Auth =====
router.post("/api/login", authController.login);

router.post("/api/public/catalogos/:catalogo", (req, res) => {
  const { catalogo } = req.params;
  catalogosController.getCatalogo(req, res, catalogo);
});
router.post("/api/public/elemento/verificar", elementosController.verificar);
router.post("/api/public/elemento", elementosController.createOrUpdate);
router.post("/api/verificar/:pagina", authController.verificarToken);
router.use("/api", catalogosDinamicosRoutes);

// ===== Sub-rutas =====
router.use("/api", elementosRoutes);
router.use("/api", usuariosRoutes);
router.use("/api", catalogosRoutes);
router.use("/api", logRoutes);
router.use("/api", pagesRoutes);
export default router;
