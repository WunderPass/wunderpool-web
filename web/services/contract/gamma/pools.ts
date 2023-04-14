import { usdc } from '../../../services/formatter';
import { gasPrice } from '../../../services/contract/init';
import { initPoolGamma } from './init';
import useWeb3 from '../../../hooks/useWeb3';

export function joinPoolGamma(poolAddress, value) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, smartContractTransaction } = useWeb3();
    const popup = openPopup('smartContract');
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.joinPool(usdc(value), {
      gasPrice: await gasPrice('polygon'),
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
