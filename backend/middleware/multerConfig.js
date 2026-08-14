import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, "../temp");

// Multer no crea su directorio de destino; debe existir antes de recibir archivos.
fs.mkdirSync(tempDir, { recursive: true });

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); // Carpeta temporal para guardar los archivos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`); // Nombre temporal único
  },
});

const upload = multer({ storage });

export default upload;
