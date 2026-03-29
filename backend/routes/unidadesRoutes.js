import express from "express";

import unidadController from "../controllers/unidadController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Aplica el middleware a todas las rutas del subrouter
router.use(authMiddleware);

router.post("/unidades", unidadController.getAll);
router.post("/unidad", unidadController.createOrUpdate);
router.post("/unidad/eliminar", unidadController.delete);
router.post("/unidad/eliminar/soft", unidadController.softDelete);

export default router;
