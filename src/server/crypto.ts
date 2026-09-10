import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export const randomToken = () => randomBytes(32).toString("base64url");
export const sha256 = (text: string) =>
  createHash("sha256").update(text).digest("hex");
export function passwordHash(
  password: string,
  salt = randomBytes(16).toString("hex"),
) {
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, expected] = stored.split(":");
  if (
    algorithm !== "scrypt" ||
    !/^[a-f0-9]{32}$/.test(salt ?? "") ||
    !/^[a-f0-9]{128}$/.test(expected ?? "") ||
    password.length > 256
  )
    return false;
  return timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(expected, "hex"),
  );
}
function keyBuffer(key: string) {
  const bytes = Buffer.from(key, "base64");
  if (bytes.length !== 32) throw new Error("invalid_encryption_key");
  return bytes;
}
export function encrypt(value: string, key: string, context: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBuffer(key), iv);
  cipher.setAAD(Buffer.from(context));
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return `v1.${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${ciphertext.toString("base64url")}`;
}
export function decrypt(envelope: string, key: string, context: string) {
  const [version, iv, tag, ciphertext, extra] = envelope.split(".");
  if (version !== "v1" || !iv || !tag || !ciphertext || extra)
    throw new Error("invalid_envelope");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    keyBuffer(key),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
