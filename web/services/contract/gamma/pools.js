import { usdc } from '/services/formatter';
import useWunderPass from '/hooks/useWunderPass';
import { gasPrice } from '/services/contract/init';
import { initPoolGamma } from './init';
import { polyValueToUsd } from '../../formatter';

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

export function fetchPoolShareholderAgreementGamma(poolAddress) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolGamma(poolAddress);

    resolve({
      min_invest: polyValueToUsd(await wunderPool.entryBarrier()),
      max_invest: null,
      max_members: null,
      min_yes_voters: 1,
      voting_threshold: 50,
      voting_time: null,
    });
  });
}
