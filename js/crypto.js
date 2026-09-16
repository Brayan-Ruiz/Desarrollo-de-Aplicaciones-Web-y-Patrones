/**
 * Finanzas Bombetas - Zero-Knowledge Crypto Engine
 * Cifrado militar AES-GCM de 256 bits y derivación de llaves PBKDF2 en el navegador.
 * Toda la información financiera se cifra antes de guardarse en el almacenamiento local.
 */

// Configuración criptográfica
const PBKDF2_ITERATIONS = 100000;
const HASH_ALGO = 'SHA-256';

/**
 * Convierte un ArrayBuffer o Uint8Array a string Base64.
 * @param {ArrayBuffer|Uint8Array} buffer
 * @returns {string}
 */
export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Convierte un string Base64 a Uint8Array.
 * @param {string} base64
 * @returns {Uint8Array}
 */
export function base64ToBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Genera una sal criptográfica segura de 16 bytes.
 * @returns {string} Sal en formato Base64
 */
export function generateSalt() {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  return bufferToBase64(salt);
}

/**
 * Genera un vector de inicialización (IV) de 12 bytes para AES-GCM.
 * @returns {Uint8Array}
 */
export function generateIV() {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Deriva una clave maestra a partir de la contraseña del usuario mediante PBKDF2.
 * @param {string} password
 * @param {string} saltBase64
 * @returns {Promise<CryptoKey>} Clave criptográfica AES-GCM
 */
export async function deriveKey(password, saltBase64) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = base64ToBuffer(saltBase64);

  // Importar la contraseña como clave base de derivación
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey', 'deriveBits']
  );

  // Derivar clave simétrica AES-GCM de 256 bits
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGO
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Genera un hash criptográfico de la contraseña con sal para verificar credenciales de acceso.
 * @param {string} password
 * @param {string} saltBase64
 * @returns {Promise<string>} Hash en Base64
 */
export async function hashPassword(password, saltBase64) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = base64ToBuffer(saltBase64);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGO
    },
    baseKey,
    256
  );

  return bufferToBase64(bits);
}

/**
 * Cifra un objeto JavaScript usando AES-GCM de 256 bits.
 * @param {object} data
 * @param {CryptoKey} cryptoKey
 * @returns {Promise<{ ciphertext: string, iv: string }>}
 */
export async function encryptVault(data, cryptoKey) {
  const encoder = new TextEncoder();
  const jsonString = JSON.stringify(data);
  const dataBuffer = encoder.encode(jsonString);

  const iv = generateIV();

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    cryptoKey,
    dataBuffer
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv)
  };
}

/**
 * Descifra una bóveda cifrada usando AES-GCM de 256 bits.
 * @param {string} ciphertextBase64
 * @param {string} ivBase64
 * @param {CryptoKey} cryptoKey
 * @returns {Promise<object>} Objeto descifrado original
 */
export async function decryptVault(ciphertextBase64, ivBase64, cryptoKey) {
  const ciphertextBuffer = base64ToBuffer(ciphertextBase64);
  const ivBuffer = base64ToBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer
    },
    cryptoKey,
    ciphertextBuffer
  );

  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decryptedBuffer);
  return JSON.parse(jsonString);
}
