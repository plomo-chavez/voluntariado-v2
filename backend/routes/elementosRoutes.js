import express from "express";

import elementoController from "../controllers/elementoController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Aplica el middleware a todas las rutas del subrouter
router.use(authMiddleware);

// router.get("/elemento/:id", elementoController.getUser);
router.post("/elementos", elementoController.getAll);
router.post("/elemento", elementoController.createOrUpdate);
router.post("/elemento/eliminar", elementoController.delete);
router.post("/elemento/eliminar/soft", elementoController.softDelete);

export default router;
