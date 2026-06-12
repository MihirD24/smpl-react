import CryptoJS from 'crypto-js';

const SECRET_KEY = 'BeJOoRxMp9SgyOh3AlqZtN+cOMa5mf47eW8aCazj3L8=';

export const encryptData = (data: any) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// Function to decrypt data
export const decryptData = (ciphertext: any) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    console.error('Decryption Error:', error);
    return null;
  }
};
