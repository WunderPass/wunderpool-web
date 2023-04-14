import { ethers } from 'ethers';
const Web3 = require('web3');
const web3 = new Web3();

export function signMessage(privateKey: string, message) {
  const { signature }: { signature: string } = web3.eth.accounts.sign(
    String(message),
    privateKey
  );
  return signature.substr(2);
}

export function signMillis(privateKey: string) {
  const millis = new Date().getTime();
  return { signedMessage: millis, signature: signMessage(privateKey, millis) };
}

export async function signTypedData(privateKey, types, values, packed = true) {
  const signer = new ethers.Wallet(privateKey);

  let message;
  if (packed) {
    message = ethers.utils.solidityKeccak256(types, values);
  } else {
    message = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(types, values)
    );
  }
  const bytes = ethers.utils.arrayify(message);
  return await signer.signMessage(bytes);
}
