import useWunderPass from '/hooks/useWunderPass';
import { initPoolGamma } from '/services/contract/gamma/init';
import { gasPrice } from '/services/contract/init';

export function voteGamma(poolAddress, proposalId, mode) {
  return new Promise(async (resolve, reject) => {
    const { smartContractTransaction } = useWunderPass({
      name: 'Casama',
      accountId: 'ABCDEF',
    });
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tx = await wunderPool.populateTransaction.vote(proposalId, mode, {
      gasPrice: await gasPrice(),
    });

    smartContractTransaction(tx)
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

export function voteForGamma(address, proposalId) {
  return voteGamma(address, proposalId, 1);
}

export function voteAgainstGamma(address, proposalId) {
  return voteGamma(address, proposalId, 2);
}

export function hasVotedGamma(poolAddress, proposalId, address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolGamma(poolAddress);
    resolve(await wunderPool.hasVoted(proposalId, address));
  });
}
