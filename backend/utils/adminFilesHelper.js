import crypto from "crypto";
import fs from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const filesHelper = require("./filesHelper.cjs");

const { crearCarpeta, escribirArchivo } = filesHelper;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_BASE_DIR = path.resolve(
  __dirname,
  "..",
  "assets",
  "uploads",
  "documentos",
);

const DEFAULT_ALLOWED_FORMATS = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];
const MIME_BY_EXTENSION = {
  pdf: ["application/pdf"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  doc: ["application/msword"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();

// Normaliza y valida los formatos permitidos para subir archivos.
export const normalizeAllowedFormats = (
  allowedFormats = DEFAULT_ALLOWED_FORMATS,
) => {
  if (Array.isArray(allowedFormats)) {
    return allowedFormats
      .map((value) => String(value).trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof allowedFormats === "string") {
    return allowedFormats
      .split(",")
      .map((value) => String(value).trim().toLowerCase())
      .filter(Boolean);
  }

  return [...DEFAULT_ALLOWED_FORMATS];
};

// Valida que el archivo subido tenga un formato y tamaño permitidos.
export const validateUploadedFile = (file, options = {}) => {
  if (!file) {
    return { valid: false, error: "No se recibió ningún archivo." };
  }

  const allowedFormats = normalizeAllowedFormats(
    options.allowedFormats || DEFAULT_ALLOWED_FORMATS,
  );
  const maxSizeBytes = options.maxSizeBytes || 5 * 1024 * 1024;
  const originalName = file.originalname || "";
  const extension = path.extname(originalName).replace(".", "").toLowerCase();
  const mimeType = (file.mimetype || "").toLowerCase();

  if (!extension) {
    return {
      valid: false,
      error: "El archivo debe tener una extensión válida.",
    };
  }

  if (!allowedFormats.includes(extension)) {
    return {
      valid: false,
      error: `El formato .${extension} no está permitido. Formatos aceptados: ${allowedFormats.join(", ")}.`,
    };
  }

  const allowedMimeTypes = MIME_BY_EXTENSION[extension] || [];
  if (
    allowedMimeTypes.length > 0 &&
    mimeType &&
    !allowedMimeTypes.includes(mimeType)
  ) {
    return {
      valid: false,
      error: `El tipo MIME ${mimeType} no coincide con el formato esperado.`,
    };
  }

  if (typeof file.size === "number" && file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo permitido de ${maxSizeBytes / (1024 * 1024)} MB.`,
    };
  }

  return { valid: true, extension, allowedFormats };
};

// Genera la ruta de almacenamiento del documento según el voluntario y el tipo de documento.
export const getDocumentStoragePath = ({
  volunteerId,
  documentType,
  destinationFolder,
} = {}) => {
  const safeVolunteerId = normalizeText(volunteerId ?? "sin-voluntario");
  const safeDocumentType = normalizeText(documentType || "documento");
  const baseDirectory = destinationFolder
    ? path.resolve(destinationFolder)
    : path.resolve(DEFAULT_BASE_DIR, "voluntarios", safeVolunteerId);

  return path.join(baseDirectory, safeDocumentType);
};

// Convierte una ruta absoluta en una ruta relativa para guardarla en la base de datos.
export const getDocumentRelativePath = (absolutePath) => {
  if (!absolutePath) return null;
  return path
    .relative(path.resolve(__dirname, ".."), absolutePath)
    .split(path.sep)
    .join("/");
};

// Guarda el archivo en una carpeta específica y devuelve la ruta donde quedó almacenado.
export const saveUploadedDocument = (file, options = {}) => {
  const validation = validateUploadedFile(file, options);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const destinationFolder =
    options.destinationFolder || getDocumentStoragePath(options);
  const directoryResult = crearCarpeta(destinationFolder, { recursive: true });

  if (!directoryResult.result) {
    throw new Error(
      directoryResult.error || "No se pudo crear la carpeta de destino.",
    );
  }

  const uploadDirectory = directoryResult.rutaCarpeta;
  const extension = validation.extension;
  const originalName = path.basename(file.originalname || "documento");
  const baseName = path.parse(originalName).name || "documento";
  const safeBaseName = normalizeText(baseName);
  const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${safeBaseName}.${extension}`;
  const targetPath = path.join(uploadDirectory, uniqueName);

  if (file.path && fs.existsSync(file.path)) {
    fs.copyFileSync(file.path, targetPath);
    if (file.path !== targetPath) {
      fs.unlinkSync(file.path);
    }
  } else if (file.buffer) {
    const writeResult = escribirArchivo(targetPath, file.buffer, {
      encoding: null,
      logs: false,
      crearCarpetaAuto: true,
    });

    if (!writeResult.result) {
      throw new Error(writeResult.error || "No se pudo escribir el archivo.");
    }
  } else {
    throw new Error("No se encontró contenido para guardar el archivo.");
  }

  return {
    savedPath: targetPath,
    relativePath: getDocumentRelativePath(targetPath),
    destinationFolder: uploadDirectory,
  };
};

// Registra el documento subido, lo guarda en disco y lo relaciona con el voluntario en la base de datos.
export const registerVolunteerDocument = async ({
  file,
  volunteerId,
  documentTypeId,
  documentModel,
  options = {},
}) => {
  if (!documentModel) {
    throw new Error(
      "Se requiere un modelo de documentos para registrar la relación.",
    );
  }

  const savedDocument = saveUploadedDocument(file, {
    volunteerId,
    documentType: options.documentType || "documento",
    destinationFolder: options.destinationFolder,
    allowedFormats: options.allowedFormats,
    maxSizeBytes: options.maxSizeBytes,
  });

  const createdRecord = await documentModel.create({
    id_voluntario: volunteerId,
    id_tipo_documento: documentTypeId,
    numero: options.numero || null,
    vigencia: options.vigencia || null,
    ruta_archivo: savedDocument.relativePath,
    fecha_registro: options.fechaRegistro || new Date(),
  });

  return {
    ...savedDocument,
    record: createdRecord,
  };
};

export const getExtensionFile = (file) => {
  if (!file || !file.originalname) return null;
  return path.extname(file.originalname).replace(".", "").toLowerCase();
};

export const getOriginalBaseName = (file) => {
  return path.parse(file.originalname || "documento").name;
};

export const createNewName = (name, newName) => {
  const source = String(newName || name || "documento");
  const base = path.parse(source).name || source;
  return base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
};

export const getFolderBackend = () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const BACKEND_DIR = path.resolve(__dirname, "..");
  return BACKEND_DIR;
};

export const getFolderExpedientes = () => {
  const isLocal = true;
  const BACKEND_DIR = getFolderBackend();
  const uploadDir = path.join(BACKEND_DIR, "files", "expedientes");
  return uploadDir;
};

export const getFolderExpediente = ({ estadoId, numeroInterno }) => {
  const EXPEDIENTES_DIR = getFolderExpedientes();

  const EXPEDIENTE_DIR = path.join(EXPEDIENTES_DIR, estadoId, numeroInterno);

  fs.mkdirSync(EXPEDIENTE_DIR, { recursive: true });

  return EXPEDIENTE_DIR;
};

// Exporta la función para que pueda ser utilizada desde otros archivos
export const getDataNewFileExpediente = ({
  file,
  documentType,
  numeroInterno,
  estadoId,
  isHistorico = false,
}) => {
  // Obtiene la ruta de la carpeta donde debe almacenarse el expediente
  const EXPEDIENTE_DIR = getFolderExpediente({
    estadoId,
    numeroInterno,
  });

  // Obtiene la ruta principal donde se encuentra el backend
  const BACKEND_DIR = getFolderBackend();
  // Obtiene la extensión del archivo, por ejemplo: pdf, jpg, png, etc.
  const extension = getExtensionFile(file);
  // Obtiene el nombre original del archivo sin su extensión
  const originalBaseName = getOriginalBaseName(file);
  // prettier-ignore
  const alternativeName = isHistorico ? `historico_${Date.now()}`: documentType.label;
  // Genera un nuevo nombre utilizando el nombre original y el tipo de documento
  const newName = createNewName(originalBaseName, alternativeName);
  // Construye el nombre final del archivo agregando el número interno y la extensión
  // Si newName está vacío, utiliza "documento" como nombre predeterminado
  const fileName = `${numeroInterno}_${newName || "documento"}.${extension}`;
  // Combina la carpeta del expediente con el nombre final para obtener la ruta absoluta
  const absolutePath = path.join(EXPEDIENTE_DIR, fileName);
  // Mueve/renombra físicamente el archivo desde su ubicación temporal
  // hacia la carpeta definitiva del expediente
  fs.renameSync(file.path, absolutePath);
  // Calcula la ruta relativa del archivo tomando como referencia la carpeta del backend
  const relativePath = path
    .relative(BACKEND_DIR, absolutePath)
    .split(path.sep)
    .join("/");

<<<<<<< HEAD
  console.log({
    absolutePath,
    relativePath,
  });
=======
>>>>>>> dev
  return {
    absolutePath,
    relativePath,
  };
};
