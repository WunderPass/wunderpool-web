import { initProposalEpsilon } from '/services/contract/epsilon/init';

export function hasVotedEpsilon(poolAddress, proposalId, address) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalEpsilon();
    resolve(await wunderProposal.hasVoted(poolAddress, proposalId, address));
  });
}
