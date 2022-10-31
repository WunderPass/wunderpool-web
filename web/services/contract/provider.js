import { ethers } from 'ethers';

export const httpProvider = new ethers.providers.AlchemyProvider(
  process.env.BLOCKCHAIN_NAME,
  process.env.ALCHEMY_API_KEY
);
export const wsProvider = ethers.providers.AlchemyProvider.getWebSocketProvider(
  process.env.BLOCKCHAIN_NAME,
  process.env.ALCHEMY_API_KEY
);
export const ethProvider =
  ethers.providers.AlchemyProvider.getWebSocketProvider(
    'homestead',
    process.env.ALCHEMY_API_KEY
  );

export function waitForTransaction(txHash) {
  return new Promise((resolve, reject) => {
    httpProvider
      .waitForTransaction(txHash)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function decodeMessage(code) {
  let codeString = `0x${code.substr(138)}`.replace(/0+$/, '');

  if (codeString.length % 2 === 1) {
    codeString += '0';
  }

  return ethers.utils.toUtf8String(codeString);
}

export async function decodeError(txHash) {
  try {
    const tx = await httpProvider.getTransaction(txHash);
    const code = await httpProvider.call(tx);
    return decodeMessage(code);
  } catch (error) {
    return 'Unknown Blockchain Error';
  }
}

export function decodeInputParams(method, input) {
  const iface = new ethers.utils.Interface([`function ${method}`]);

  return iface.decodeFunctionData(method, input);
}
