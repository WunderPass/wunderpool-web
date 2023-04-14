import { SupportedChain } from './types';
import { ethers } from 'ethers';

export const httpProvider = (chain: SupportedChain) => {
  switch (chain) {
    case 'polygon':
      return new ethers.providers.AlchemyProvider(
        'matic',
        process.env.ALCHEMY_API_KEY
      );
    case 'gnosis':
      return new ethers.providers.JsonRpcProvider(
        'https://rpc.gnosischain.com'
      );
    default:
      throw `Unsupported Chain: ${chain}`;
  }
};

export const ethProvider = new ethers.providers.AlchemyProvider(
  'homestead',
  process.env.ALCHEMY_API_KEY
);

export async function getEnsName(address: string) {
  try {
    return await ethProvider.lookupAddress(address);
  } catch (error) {
    return null;
  }
}

export function waitForTransaction(txHash: string, chain: SupportedChain) {
  return new Promise((resolve, reject) => {
    httpProvider(chain)
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

export async function decodeError(txHash: string, chain: SupportedChain) {
  try {
    const provider = httpProvider(chain);
    const tx = await provider.getTransaction(txHash);
    const code = await provider.call(tx);
    return decodeMessage(code);
  } catch (error) {
    return 'Unknown Blockchain Error';
  }
}

export function decodeInputParams(method: string, input) {
  const iface = new ethers.utils.Interface([`function ${method}`]);

  return iface.decodeFunctionData(method, input);
}
