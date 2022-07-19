import { connectContract } from '/services/contract/init';
import useWunderPass from '/hooks/useWunderPass';
import {
  initPoolEpsilon,
  initProposalEpsilon,
} from '/services/contract/epsilon/init';
import { gasPrice } from '/services/contract/init';

export function voteEpsilon(poolAddress, proposalId, mode, userAddress) {
  return new Promise(async (resolve, reject) => {
    const { sendSignatureRequest } = useWunderPass({
      name: 'Casama',
      accountId: 'ABCDEF',
      userAddress,
    });
    const types = ['address', 'address', 'uint', 'uint'];
    const values = [userAddress, poolAddress, proposalId, mode];

    sendSignatureRequest(types, values)
      .then(async (signature) => {
        const [wunderPool] = initPoolEpsilon(poolAddress);
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

export function voteForEpsilon(address, proposalId) {
  return voteEpsilon(address, proposalId, 1, userAddress);
}

export function voteAgainstEpsilon(address, proposalId) {
  return voteEpsilon(address, proposalId, 2, userAddress);
}

export function hasVotedEpsilon(poolAddress, proposalId, address) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalEpsilon();
    resolve(await wunderProposal.hasVoted(poolAddress, proposalId, address));
  });
}
