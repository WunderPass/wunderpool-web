import { ethers } from 'ethers';

export const httpProvider = new ethers.providers.AlchemyProvider(
  process.env.BLOCKCHAIN_NAME,
  process.env.ALCHEMY_API_KEY
);
export const wsProvider = ethers.providers.AlchemyProvider.getWebSocketProvider(
  process.env.BLOCKCHAIN_NAME,
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
