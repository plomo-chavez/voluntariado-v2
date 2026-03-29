import express from "express";

import logsController from "../controllers/logsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Aplica el middleware a todas las rutas del subrouter
router.use(authMiddleware);

router.post("/logs", logsController.getAll);


export default router;
