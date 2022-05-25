import useWunderPass from '/hooks/useWunderPass';
import { initPoolDelta } from '/services/contract/delta/init';

export function voteDelta(poolAddress, proposalId, mode, userAddress) {
  return new Promise(async (resolve, reject) => {
    const { sendSignatureRequest } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
    });
    const data = [userAddress, poolAddress, proposalId, mode];

    sendSignatureRequest(data)
      .then(async (signature) => {
        const tx = await wunderPool.voteForUser(
          userAddress,
          proposalId,
          mode,
          signature,
          { gasPrice: await gasPrice() }
        );

        const result = await tx.wait();
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function voteForDelta(address, proposalId) {
  return voteDelta(address, proposalId, 1, userAddress);
}

export function voteAgainstDelta(address, proposalId) {
  return voteDelta(address, proposalId, 2, userAddress);
}

export function hasVotedDelta(poolAddress, proposalId, address) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPoolDelta(poolAddress);
    resolve(await wunderPool.hasVoted(proposalId, address));
  });
}
