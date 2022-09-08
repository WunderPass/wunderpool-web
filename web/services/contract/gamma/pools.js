import { usdc } from '/services/formatter';
import useWunderPass from '/hooks/useWunderPass';
import { gasPrice } from '/services/contract/init';
import { initPoolGamma } from './init';
import { polyValueToUsd } from '../../formatter';

export function joinPoolGamma(poolAddress, value) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, smartContractTransaction } = useWunderPass({
      name: 'Casama',
      accountId: 'ABCDEF',
    });
    const popup = openPopup('smartContract');
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.joinPool(usdc(value), {
      gasPrice: await gasPrice(),
    });

    smartContractTransaction(
      tx,
      {
        amount: usdc(value),
        spender: poolAddress,
      },
      'polygon',
      popup
    )
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
    const { openPopup, smartContractTransaction } = useWunderPass({
      name: 'Casama',
      accountId: 'ABCDEF',
    });
    const popup = openPopup('smartContract');

    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.fundPool(usdc(amount), {
      gasPrice: await gasPrice(),
    });

    smartContractTransaction(
      tx,
      {
        amount: usdc(amount),
        spender: poolAddress,
      },
      'polygon',
      popup
    )
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
