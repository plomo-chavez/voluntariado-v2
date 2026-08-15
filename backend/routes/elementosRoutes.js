import express from "express";

import elementosController from "../controllers/elementosController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/multerConfig.js";

const router = express.Router();

// Aplica el middleware a todas las rutas del subrouter
router.use(authMiddleware);

router.post("/elemento", elementosController.createOrUpdate);
router.get("/elemento/:id", elementosController.getById);
router.post("/elementos", elementosController.getAll);
router.post("/elemento/descargar", elementosController.descargarDocumentos);
router.post("/elemento/eliminar", elementosController.delete);
router.post("/elemento/eliminar/soft", elementosController.softDelete);
router.post("/elemento/verificar", elementosController.verificar);
router.post("/elemento/documentos", elementosController.getDocumentos);
router.post(
  "/elemento/carga/documento",
  upload.single("documento"),
  elementosController.cargarDocumento,
);

export default router;
