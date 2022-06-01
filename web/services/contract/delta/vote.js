import { connectContract } from '/services/contract/init';
import useWunderPass from '/hooks/useWunderPass';
import {
  initPoolDelta,
  initProposalDelta,
} from '/services/contract/delta/init';
import { gasPrice } from '/services/contract/init';

export function voteDelta(poolAddress, proposalId, mode, userAddress) {
  return new Promise(async (resolve, reject) => {
    const { sendSignatureRequest } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
    });
    const types = ['address', 'address', 'uint', 'uint'];
    const values = [userAddress, poolAddress, proposalId, mode];

    sendSignatureRequest(types, values)
      .then(async (signature) => {
        const [wunderPool] = initPoolDelta(poolAddress);
        const tx = await connectContract(wunderPool).voteForUser(
          userAddress,
          proposalId,
          mode,
          signature.signature,
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
    const [wunderProposal] = initProposalDelta();
    resolve(await wunderProposal.hasVoted(poolAddress, proposalId, address));
  });
}
