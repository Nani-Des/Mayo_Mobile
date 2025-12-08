import Aes from 'react-native-aes-crypto';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Base64 } from 'js-base64';

const AES_KEY_KEY = 'mayo_aes_key';
const ECDSA_PRIVATE_KEY_KEY = 'mayo_ecdsa_private_key';
const ECDSA_PUBLIC_KEY_KEY = 'mayo_ecdsa_public_key';

export async function getOrGenerateAESKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(AES_KEY_KEY);
  if (!key) {
    const keyBytes = await Crypto.getRandomBytesAsync(32); // 256 bits
    key = Base64.encode(String.fromCharCode(...keyBytes));
    await SecureStore.setItemAsync(AES_KEY_KEY, key);
  }
  return key as string;
}

export async function encryptData(data: string): Promise<{ encrypted: string; iv: string }> {
  const key = await getOrGenerateAESKey();
  const iv = await Crypto.getRandomBytesAsync(12); // 96 bits for GCM
  const ivBase64 = Base64.encode(String.fromCharCode(...iv));

  const encrypted = await Aes.encrypt(data, key, ivBase64, 'aes-256-gcm' as any);
  return { encrypted, iv: ivBase64 };
}

export async function decryptData(encrypted: string, iv: string): Promise<string> {
  const key = await getOrGenerateAESKey();
  const decrypted = await Aes.decrypt(encrypted, key, iv, 'aes-256-gcm' as any);
  return decrypted;
}

export async function generateSHA256(data: string): Promise<string> {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
}

export async function getOrGenerateECDSAKeyPair(): Promise<{ privateKey: string; publicKey: string }> {
  let privateKey = await SecureStore.getItemAsync(ECDSA_PRIVATE_KEY_KEY);
  let publicKey = await SecureStore.getItemAsync(ECDSA_PUBLIC_KEY_KEY);

  if (!privateKey || !publicKey) {
    // Generate new key pair
    const keyPair = await (Crypto as any).generateKeyPairAsync((Crypto as any).CryptoKeyPairType.ECDSA, {
      namedCurve: (Crypto as any).CryptoNamedCurve.P256,
    });
    privateKey = keyPair.privateKey;
    publicKey = keyPair.publicKey;

    await SecureStore.setItemAsync(ECDSA_PRIVATE_KEY_KEY, privateKey!);
    await SecureStore.setItemAsync(ECDSA_PUBLIC_KEY_KEY, publicKey!);
  }

  return { privateKey: privateKey!, publicKey: publicKey! };
}

export async function signData(data: string): Promise<string> {
  const { privateKey } = await getOrGenerateECDSAKeyPair();
  const signature = await (Crypto as any).signAsync((Crypto as any).CryptoDigestAlgorithm.SHA256, data, privateKey);
  return signature;
}

export async function verifySignature(data: string, signature: string): Promise<boolean> {
  const { publicKey } = await getOrGenerateECDSAKeyPair();
  return await (Crypto as any).verifyAsync((Crypto as any).CryptoDigestAlgorithm.SHA256, data, signature, publicKey);
}