import { hdkey } from 'ethereumjs-wallet';
const CryptoJS = require('crypto-js');
const BIP39 = require('bip39');
const Wallet = require('ethereumjs-wallet').default;

function generateHexSeed(seed) {
  return BIP39.mnemonicToSeedSync(seed);
}

export function encrypt(data, password) {
  return CryptoJS.Rabbit.encrypt(data, password).toString();
}

export function decrypt(data, password) {
  try {
    return CryptoJS.Rabbit.decrypt(data, password).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
}

export function encryptKey(privateKey, password, save = false) {
  const encrypted = encrypt(privateKey, password);
  localStorage.setItem('privKey', encrypted);
  if (save) {
    localStorage.setItem('decrPrivKey', privateKey);
    localStorage.setItem('destroyKeyAt', new Date().getTime() + 604800000);
  }
}

export function decryptKey(password, save = false) {
  const privateKey = localStorage.getItem('privKey');
  if (privateKey) {
    const privKey = decrypt(privateKey, password);
    if (save) {
      localStorage.setItem('decrPrivKey', privKey);
      localStorage.setItem('destroyKeyAt', new Date().getTime() + 604800000);
    }
    return privKey;
  } else {
    throw 'PrivateKey not found';
  }
}

export function encryptSeed(seedPhrase, password) {
  const encrypted = encrypt(seedPhrase, password);
  localStorage.setItem('seedPhrase', encrypted);
  return encrypted;
}

export function decryptSeed(password) {
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
  if (new Date().getTime() > Number(localStorage.getItem('destroyKeyAt'))) {
    localStorage.removeItem('decrPrivKey');
  } else {
    const decrPrivKey = localStorage.getItem('decrPrivKey');
    if (decrPrivKey == 'null') {
      return null;
    } else return decrPrivKey;
  }
  return null;
}

export function generateKeys(seedPhrase) {
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

export function publicFromPrivate(privKey) {
  let privKeyBuffer = Buffer.from(privKey, 'hex');
  let wallet = Wallet.fromPrivateKey(privKeyBuffer);
  return wallet.getPublicKey().toString('hex');
}

export function addressFromPrivate(privKey) {
  let privKeyBuffer = Buffer.from(privKey, 'hex');
  let wallet = Wallet.fromPrivateKey(privKeyBuffer);
  return '0x' + wallet.getAddress().toString('hex');
}
