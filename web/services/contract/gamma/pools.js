import { usdc } from '/services/formatter';
import useWunderPass from '/hooks/useWunderPass';
import { gasPrice } from '/services/contract/init';
import { initPoolGamma } from './init';

export function joinPoolGamma(poolAddress, value) {
  return new Promise(async (resolve, reject) => {
    const { smartContractTransaction } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
    });
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.joinPool(usdc(value), {
      gasPrice: await gasPrice(),
    });

    smartContractTransaction(tx, {
      amount: usdc(value),
      spender: poolAddress,
    })
      .then(async (transaction) => {
        try {
          const receipt = await provider.waitForTransaction(transaction.hash);
          resolve(receipt);
        } catch (error) {
          reject(error?.error?.error?.error?.message || error);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function fundPoolGamma(poolAddress, amount) {
  return new Promise(async (resolve, reject) => {
    const { smartContractTransaction } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
    });
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.fundPool(usdc(amount), {
      gasPrice: await gasPrice(),
    });

    smartContractTransaction(tx, {
      amount: usdc(amount),
      spender: poolAddress,
    })
      .then(async (transaction) => {
        try {
          const receipt = await provider.waitForTransaction(transaction.hash);
          resolve(receipt);
        } catch (error) {
          reject(error?.error?.error?.error?.message || error);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}
