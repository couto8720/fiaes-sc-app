import crypto from "crypto";

/**
 * Encriptação de dados sensíveis
 * Usa AES-256-GCM para encriptação de ponta a ponta
 * Para dados como nomes, emails, etc que precisam de proteção extra
 */

interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  algorithm: string;
}

const ALGORITHM = "aes-256-gcm";
const ENCODING = "hex";

/**
 * Obtém a chave de encriptação do ambiente
 * ENCRYPTION_KEY deve ser um hex string de 64 caracteres (32 bytes)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY not configured in environment");
  }

  if (key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  }

  return Buffer.from(key, ENCODING);
}

/**
 * Encripta um string
 */
export function encrypt(plaintext: string): EncryptedData {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let ciphertext = cipher.update(plaintext, "utf8", ENCODING as any);
    ciphertext += cipher.final(ENCODING);

    const authTag = cipher.getAuthTag();

    return {
      ciphertext,
      iv: iv.toString(ENCODING),
      authTag: authTag.toString(ENCODING),
      algorithm: ALGORITHM,
    };
  } catch (error) {
    console.error("Erro ao encriptar dados:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Desencripta um string
 */
export function decrypt(encrypted: EncryptedData): string {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(encrypted.iv, ENCODING);
    const authTag = Buffer.from(encrypted.authTag, ENCODING);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let plaintext = decipher.update(encrypted.ciphertext, ENCODING, "utf8" as any);
    plaintext += decipher.final("utf8");

    return plaintext;
  } catch (error) {
    console.error("Erro ao desencriptar dados:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Encripta um objeto e armazena como JSON
 */
export function encryptObject<T extends Record<string, any>>(obj: T): string {
  const json = JSON.stringify(obj);
  const encrypted = encrypt(json);
  return JSON.stringify(encrypted);
}

/**
 * Desencripta um objeto armazenado como JSON
 */
export function decryptObject<T extends Record<string, any>>(encrypted: string): T {
  try {
    const data = JSON.parse(encrypted) as EncryptedData;
    const json = decrypt(data);
    return JSON.parse(json) as T;
  } catch (error) {
    console.error("Erro ao desencriptar objeto:", error);
    throw new Error("Failed to decrypt object");
  }
}

/**
 * Gera uma chave de encriptação segura para configuração
 * Executar uma vez e adicionar ao .env.local
 */
export function generateEncryptionKey(): string {
  const key = crypto.randomBytes(32);
  return key.toString(ENCODING);
}

/**
 * Hash seguro para dados sensíveis (one-way)
 * Usar para senhas, tokens, etc
 */
export function hashData(data: string, salt: string = ""): string {
  const hash = crypto.createHash("sha256");
  hash.update(data + salt as any);
  return hash.digest(ENCODING);
}

/**
 * Verifica se um hash corresponde aos dados
 */
export function verifyHash(data: string, hash: string, salt: string = ""): boolean {
  return hashData(data, salt) === hash;
}

/**
 * Gera um token aleatório seguro
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString(ENCODING);
}

/**
 * Setup de encriptação
 * Instruções:
 *
 * 1. Gerar chave:
 *    node -e "console.log(require('./src/lib/encryption').generateEncryptionKey())"
 *
 * 2. Adicionar ao .env.local:
 *    ENCRYPTION_KEY=<chave gerada>
 *
 * 3. Usar na aplicação:
 *    const encrypted = encrypt("dados sensíveis");
 *    const decrypted = decrypt(encrypted);
 */
