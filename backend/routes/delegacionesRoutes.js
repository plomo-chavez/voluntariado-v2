import express from "express";

import delegacionController from "../controllers/delegacionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Aplica el middleware a todas las rutas del subrouter
router.use(authMiddleware);

router.post("/delegaciones", delegacionController.getAll);
router.get("/delegacion/:id", delegacionController.getUser);
router.post("/delegacion", delegacionController.createOrUpdate);
router.post("/delegacion/eliminar", delegacionController.delete);
router.post("/delegacion/eliminar/soft", delegacionController.softDelete);

export default router;
