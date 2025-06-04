import CryptoJS from 'crypto-js';

// Encryption helpers for License Verification API
export function encryptData(data: any): string {
  if (!process.env.AES_SECRET_KEY) {
    throw new Error('AES_SECRET_KEY is not defined');
  }
  
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, process.env.AES_SECRET_KEY).toString();
}

export function decryptData(encryptedData: string): any {
  if (!process.env.AES_SECRET_KEY) {
    throw new Error('AES_SECRET_KEY is not defined');
  }
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, process.env.AES_SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedData) {
      throw new Error('Decryption failed');
    }
    
    return JSON.parse(decryptedData);
  } catch (error) {
    throw new Error('Invalid encrypted data');
  }
}