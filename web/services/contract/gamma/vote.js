import useWeb3 from '../../../hooks/useWeb3';
import { initPoolGamma } from '/services/contract/gamma/init';
import { gasPrice } from '/services/contract/init';

export function voteGamma(poolAddress, proposalId, mode) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, smartContractTransaction } = useWeb3();
    const popup = openPopup('smartContract');
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.vote(proposalId, mode, {
      gasPrice: await gasPrice(),
    });

    smartContractTransaction(tx, null, 'polygon', popup)
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

export function hasVotedGamma(poolAddress, proposalId, address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolGamma(poolAddress);
    resolve(await wunderPool.hasVoted(proposalId, address));
  });
}
