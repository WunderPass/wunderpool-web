import { hdkey } from 'ethereumjs-wallet';
const CryptoJS = require('crypto-js');
const BIP39 = require('bip39');
const Wallet = require('ethereumjs-wallet').default;

function generateHexSeed(seed: string) {
  return BIP39.mnemonicToSeedSync(seed);
}

export function encrypt(data: string, password: string) {
  return CryptoJS.Rabbit.encrypt(data, password).toString();
}

export function decrypt(data: string, password: string) {
  try {
    return CryptoJS.Rabbit.decrypt(data, password).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
}

export function encryptKey(privateKey: string, password: string, save = false) {
  const encrypted = encrypt(privateKey, password);
  localStorage.setItem('privKey', encrypted);
  if (save) {
    localStorage.setItem('decrPrivKey', privateKey);
  }
}

export function decryptKey(password: string, save = false) {
  const privateKey = localStorage.getItem('privKey');
  if (privateKey) {
    const privKey = decrypt(privateKey, password);
    if (save) {
      localStorage.setItem('decrPrivKey', privKey);
    }
    return privKey;
  } else {
    throw 'PrivateKey not found';
  }
}

export function encryptSeed(seedPhrase: string, password: string) {
  const encrypted = encrypt(seedPhrase, password);
  localStorage.setItem('seedPhrase', encrypted);
  return encrypted;
}

export function decryptSeed(password: string) {
  const seedPhrase = localStorage.getItem('seedPhrase');
  if (seedPhrase) {
    // Migration for Users with unencrypted Private Key
    if (seedPhrase.split(' ').length == 12) {
      const key = decryptKey(password);
      if (!key) throw 'Invalid Password';
      encryptSeed(seedPhrase, password);
      return seedPhrase;
    } else {
      return decrypt(seedPhrase, password);
    }
  } else {
    throw 'Seed Phrase not found';
  }
}

export function retreiveKey() {
  const decrPrivKey = localStorage.getItem('decrPrivKey');
  if (decrPrivKey == 'null') return null;
  return decrPrivKey;
}

export function generateKeys(seedPhrase: string) {
  let seed = generateHexSeed(seedPhrase);
  let wallet = hdkey
    .fromMasterSeed(seed)
    .derivePath(`m/44'/60'/0'/0/0`)
    .getWallet();
  return {
    privKey: wallet.getPrivateKey().toString('hex'),
    pubKey: wallet.getPublicKey().toString('hex'),
    address: '0x' + wallet.getAddress().toString('hex'),
  };
}

export function publicFromPrivate(privKey: string): string {
  let privKeyBuffer = Buffer.from(privKey, 'hex');
  let wallet = Wallet.fromPrivateKey(privKeyBuffer);
  return wallet.getPublicKey().toString('hex');
}

export function addressFromPrivate(privKey: string): string {
  let privKeyBuffer = Buffer.from(privKey, 'hex');
  let wallet = Wallet.fromPrivateKey(privKeyBuffer);
  return '0x' + wallet.getAddress().toString('hex');
}
