import fs from "fs/promises";
import fsSync from "fs"; // si usas fs/promises, añade también fsSync para lecturas sincrónicas
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, "..");

function resolveBackendPath(p) {
  if (!p) return null;
  if (path.isAbsolute(p)) return p;
  // evitar que pase rutas como 'backend/assets/..' y produzca backend/backend/...
  const cleaned = p.replace(/^\/*backend[\\/]+/, "");
  return path.resolve(backendRoot, cleaned);
}

let browserInstance = null;

/**
 * Obtiene una instancia reutilizable de Chromium
 */
async function getBrowser() {
  try {
    if (browserInstance && typeof browserInstance.isConnected === "function") {
      if (browserInstance.isConnected()) return browserInstance;
      // si no está conectado, cerrar y crear uno nuevo
      try {
        await browserInstance.close();
      } catch (e) {}
      browserInstance = null;
    }

    const launchOpts = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    browserInstance = await puppeteer.launch(launchOpts);
    return browserInstance;
  } catch (err) {
    // retry once with minimal args
    try {
      browserInstance = await puppeteer.launch({ headless: true });
      return browserInstance;
    } catch (err2) {
      browserInstance = null;
      throw err2;
    }
  }
}

/**
 * Genera un PDF a partir de una plantilla HTML
 *
 * @param {Object} params
 * @param {String} params.template
 * @param {Object} params.data
 * @param {String} params.outDir
 * @param {String} params.outName
 * @param {String} params.dir
 * @param {Object} params.pdfOptions
 */
export async function generatePdfFromTemplateHTML({
  template,
  data = {},
  outDir,
  outName,
  dir = path.join(backendRoot, "assets", "plantillas"),
  pdfOptions = {},
  images = null,
}) {
  if (!template) {
    return {
      result: false,
      message: "template es requerido",
    };
  }

  if (!outDir) {
    return {
      message: "outDir es requerido",
    };
  }

  // soporte por defecto para plantilla 'caratula'
  if (template === "caratula" && !images) {
    images = {
      logoCRSrc: path.join(backendRoot, "assets", "resources", "logoCR.jpg"),
    };
  }

  // Normalizar images: aceptar null, objeto { key: path } o array [{ key, path, data }]
  const imagesArray = [];
  if (images && !Array.isArray(images) && typeof images === "object") {
    for (const [key, val] of Object.entries(images)) {
      imagesArray.push({ key, path: val });
    }
  } else if (Array.isArray(images)) {
    imagesArray.push(...images);
  }

  // Procesar imágenes y convertir a data URIs, inyectando en `data[key]` si no existe
  if (imagesArray.length > 0) {
    for (const img of imagesArray) {
      try {
        const key = img.key || img.name;
        if (!key) continue;

        // si ya existe un valor en data, no sobrescribir
        if (typeof data[key] !== "undefined" && data[key] !== null) continue;

        if (img.data && typeof img.data === "string") {
          if (img.data.startsWith("data:")) {
            data[key] = img.data;
          } else {
            data[key] = `data:image/png;base64,${img.data}`;
          }
          continue;
        }

        if (img.path && typeof img.path === "string") {
          const imgPath = path.isAbsolute(img.path)
            ? img.path
            : resolveBackendPath(img.path);
          try {
            const buf = await fs.readFile(imgPath);
            const ext = (path.extname(imgPath) || ".png").replace(/^\./, "").toLowerCase() || "png";
            data[key] = `data:image/${ext};base64,${Buffer.from(buf).toString("base64")}`;
          } catch (eimg) {
            console.error(`No se pudo leer imagen ${imgPath}:`, eimg.message || eimg);
          }
        }
      } catch (e) {
        console.error("Error procesando images param:", e.message || e);
      }
    }
  }

  // Registrar helper inlineImage como respaldo (acepta path o key)
  Handlebars.registerHelper("inlineImage", function (relativeOrAbsolutePathOrKey) {
    try {
      const arg = String(relativeOrAbsolutePathOrKey || "");
      // si el argumento es una clave presente en data y ya es data URI, devolverla
      if (data && typeof data[arg] === "string" && data[arg].startsWith("data:")) {
        return data[arg];
      }

      // si el argumento parece una data URI ya
      if (arg.startsWith("data:")) return arg;

      // si el argumento es una ruta relativa/absoluta, leer el archivo
      const imgPath = path.isAbsolute(arg) ? arg : resolveBackendPath(arg);
      try {
        const buf = fsSync.readFileSync(imgPath);
        const ext = path.extname(imgPath).slice(1) || "png";
        return `data:image/${ext};base64,${buf.toString("base64")}`;
      } catch (e) {
        return "";
      }
    } catch (e) {
      return "";
    }
  });

  const templatesDir = path.isAbsolute(dir) ? dir : resolveBackendPath(dir);

  const templatePath = path.join(
    templatesDir,
    path.extname(template) ? template : `${template}.html`,
  );

  try {
    await fs.access(templatePath);
  } catch {
    throw new Error(`Template no encontrado: ${templatePath}`);
  }

  const templateContent = await fs.readFile(templatePath, "utf8");

  // Buscar placeholders en la plantilla y asegurar que data tenga claves para cada uno
  const placeholderRegex = /{{\s*([\w_-]+)\s*}}/g;
  const keys = new Set();
  let m;
  while ((m = placeholderRegex.exec(templateContent)) !== null) {
    keys.add(m[1]);
  }

  if (keys.size === 0) {
    throw new Error(
      `La plantilla no contiene marcadores tipo {{nombre}}: ${templatePath}`,
    );
  }

  // rellenar con '-NoData-' las claves faltantes
  for (const k of keys) {
    if (typeof data[k] === "undefined" || data[k] === null) {
      data[k] = "-NoData-";
    }
  }

  /**
   * Helper para checkbox

    // Procesar imágenes opcionales: images = [{ key, path, data }]
    if (images && Array.isArray(images)) {
      for (const img of images) {
        try {
          const key = img.key || img.name;
          if (!key) continue;

          // si ya existe un valor en data, no sobrescribir
          if (typeof data[key] !== "undefined" && data[key] !== null) continue;

          if (img.data && typeof img.data === "string") {
            // si ya es data URI o base64 crudo, intentar usar como data URI
            if (img.data.startsWith("data:")) {
              data[key] = img.data;
            } else {
              // asumir base64 crudo -> necesita tipo, default png
              data[key] = `data:image/png;base64,${img.data}`;
            }
            continue;
          }

          if (img.path && typeof img.path === "string") {
            const imgPath = path.isAbsolute(img.path) ? img.path : resolveBackendPath(img.path);
            try {
              const buf = await fs.readFile(imgPath);
              const ext = (path.extname(imgPath) || ".png").replace(/^\./, "").toLowerCase() || "png";
              data[key] = `data:image/${ext};base64,${Buffer.from(buf).toString("base64")}`;
            } catch (eimg) {
              // no detener el proceso si una imagen falla; dejar como -NoData-
              console.error(`No se pudo leer imagen ${imgPath}:`, eimg.message);
            }
          }
        } catch (e) {
          console.error("Error procesando images param:", e.message);
        }
      }
    }

    // rellenar con '-NoData-' las claves faltantes
    for (const k of keys) {
      if (typeof data[k] === "undefined" || data[k] === null) {
        data[k] = "-NoData-";
      }
    }
  });

  /**
   * Helper para fechas
   */
  Handlebars.registerHelper("date", function (value) {
    if (!value) return "";

    return new Date(value).toLocaleDateString("es-MX");
  });

  const compiled = Handlebars.compile(templateContent);

  const html = compiled(data);

  const outputDir = path.isAbsolute(outDir)
    ? outDir
    : resolveBackendPath(outDir);

  await fs.mkdir(outputDir, {
    recursive: true,
  });

  const filename =
    outName ||
    `${path.basename(template, path.extname(template))}-${Date.now()}.pdf`;

  const outputPath = path.join(
    outputDir,
    filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
  );

  const browser = await getBrowser();
  let page;
  try {
    page = await browser.newPage();
  } catch (errNewPage) {
    // intentar reiniciar browser y volver a crear página
    try {
      if (browserInstance) {
        try {
          await browserInstance.close();
        } catch {}
        browserInstance = null;
      }
      const newBrowser = await getBrowser();
      page = await newBrowser.newPage();
    } catch (err2) {
      throw new Error(
        "No se pudo crear una nueva página en Chromium: " + err2.message,
      );
    }
  }

  try {
    await page.setContent(html, {
      waitUntil: ["domcontentloaded", "networkidle0"],
    });

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      preferCSSPageSize: true,

      margin: {
        top: "8mm",
        right: "8mm",
        bottom: "8mm",
        left: "8mm",
      },

      ...pdfOptions,
    });

    await fs.writeFile(outputPath, pdfBuffer);

    return {
      success: true,
      filename: path.basename(outputPath),
      path: outputPath,
      buffer: pdfBuffer,
    };
  } catch (error) {
    throw new Error(`Error generando PDF: ${error.message}`);
  } finally {
    if (page && typeof page.close === "function") {
      try {
        await page.close();
      } catch (e) {}
    }
  }
}

/**
 * Cierra Chromium cuando el servidor termine
 */
export async function closePdfBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export async function prepareDocuments({
  documents = [],
  outDir,
  outName = null,
  deleteFiles = false,
}) {
  if (!Array.isArray(documents)) {
    throw new Error("documents debe ser un arreglo");
  }

  if (documents.length === 1) {
    const document = documents[0];

    if (deleteFiles && document.path) {
      try {
        await fs.unlink(document.path);
      } catch {}
    }

    return {
      success: true,
      merged: false,
      filename: document.filename,
      path: document.path,
      buffer: document.buffer,
      fileBase64: document.buffer
        ? Buffer.from(document.buffer).toString("base64")
        : null,
      sizeKB: document.buffer
        ? Math.round(Buffer.byteLength(document.buffer) / 1024)
        : null,
    };
  }

  console.log(
    `Múltiples documentos (${documents.length}), procediendo a fusionar...`,
  );
  const mergedPdf = await PDFDocument.create();

  for (const document of documents) {
    let pdfBytes;

    if (document.buffer) {
      pdfBytes = document.buffer;
    } else if (document.path) {
      pdfBytes = await fs.readFile(document.path);
    } else {
      continue;
    }

    const pdf = await PDFDocument.load(pdfBytes);

    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBuffer = await mergedPdf.save();
  let outputPath = null;
  const filename = outName || `merged-${Date.now()}.pdf`;

  // resolver outDir por defecto dentro de backend/assets/tmp
  const finalOutDir = outDir
    ? path.isAbsolute(outDir)
      ? outDir
      : resolveBackendPath(outDir)
    : path.join(backendRoot, "assets", "tmp");

  await fs.mkdir(finalOutDir, { recursive: true });

  outputPath = path.join(
    finalOutDir,
    filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
  );

  await fs.writeFile(outputPath, mergedBuffer);

  /**
   * Eliminar PDFs origen
   */

  if (deleteFiles) {
    await Promise.allSettled(
      documents.map(async (document) => {
        if (!document.path) return;

        try {
          await fs.unlink(document.path);
        } catch {}
      }),
    );
  }

  return {
    success: true,
    filename,
    path: outputPath,
    buffer: mergedBuffer,
    fileBase64: mergedBuffer
      ? Buffer.from(mergedBuffer).toString("base64")
      : null,
    sizeKB: mergedBuffer
      ? Math.round(Buffer.byteLength(mergedBuffer) / 1024)
      : null,
  };
}
