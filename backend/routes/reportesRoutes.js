import express from "express";

import reportesController from "../controllers/reportesController.js";
import reportesRISController from "../controllers/reportesRISController.js";
import reportesSARController from "../controllers/reportesSARController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Aplica el middleware a todas las rutas del subrouter
router.use(authMiddleware);
router.post("/reportes/get", reportesController.getAll);
router.post("/reportes/eliminar", reportesController.deleteRecord);
router.post("/reportes/eliminar/soft", reportesController.softDelete);

// ===== SAR =====
router.post("/reportes/sar/get", reportesSARController.getAll);
router.post("/reportes/sar", reportesSARController.createOrUpdate);

// ===== RIS =====
router.post("/reportes/ris/get", reportesRISController.getAll);
router.post("/reportes/ris", reportesRISController.createOrUpdate);

// ===== Estadísticas =====
router.post("/reportes/estadisticas", reportesController.getEstadisticas);
router.post("/reportes/estadisticas2", reportesController.getEstadisticas2);

export default router;
