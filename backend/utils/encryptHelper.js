import crypto from "crypto";
import base32 from "hi-base32";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";
const ENC_SECRET =
  process.env.JWT_ENCRYPT_KEY || "delfaroSuperClaveSeguraAES256123456";

const key = crypto.createHash("sha256").update(ENC_SECRET).digest();

export function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(token) {
  const buffer = Buffer.from(token, "base64");

  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted, null, "utf8") + decipher.final("utf8");
}

export function createTokenJWT(payload, expiresIn = "8h") {
  const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn });
  return encrypt(jwtToken);
}

export function verifyEncryptedJWT(token) {
  const decrypted = decrypt(token);
  return jwt.verify(decrypted, JWT_SECRET);
}

const SECRET_SHORTTOKEN =
  process.env.TOKEN_SECRET || "delfaroSuperClaveSeguraAES256123456";

export function createShortToken(expiresInMinutes = 10) {
  const random = crypto.randomBytes(6);
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;

  const expBuffer = Buffer.alloc(4);
  expBuffer.writeUInt32BE(expiresAt);

  const payload = Buffer.concat([random, expBuffer]);

  const signature = crypto
    .createHmac("sha256", SECRET_SHORTTOKEN)
    .update(payload)
    .digest()
    .subarray(0, 4);

  const tokenBuffer = Buffer.concat([payload, signature]);

  let tmp = base32.encode(tokenBuffer);
  return tmp;
}

export function verifyShortToken(token) {
  let buffer;

  try {
    buffer = Buffer.from(base32.decode.asBytes(token));
  } catch {
    return {
      result: false,
      message: "Token inválido",
    };
  }

  if (buffer.length !== 14) {
    return {
      result: false,
      message: "Token inválido",
    };
  }

  const payload = buffer.subarray(0, 10);
  const signature = buffer.subarray(10, 14);

  const expectedSignature = crypto
    .createHmac("sha256", SECRET_SHORTTOKEN)
    .update(payload)
    .digest()
    .subarray(0, 4);

  if (!crypto.timingSafeEqual(signature, expectedSignature)) {
    return {
      result: false,
      message: "Token inválido",
    };
  }

  const expiresAt = payload.readUInt32BE(6);

  if (expiresAt < Math.floor(Date.now() / 1000)) {
    return {
      result: false,
      message: "Token expirado",
    };
  }

  return {
    result: true,
    expiresAt,
    random: payload.subarray(0, 6).toString("hex"),
  };
}

export default {
  encrypt,
  decrypt,
  createTokenJWT,
  verifyEncryptedJWT,
  createShortToken,
  verifyShortToken,
};
