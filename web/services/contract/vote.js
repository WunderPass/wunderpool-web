import { hasVotedDelta, voteDelta } from './delta/vote';
import { hasVotedEpsilon } from './epsilon/vote';
import { hasVotedGamma, voteGamma } from './gamma/vote';

export function vote(poolAddress, proposalId, mode, userAddress, version) {
  if (version > 3) {
    return voteDelta(poolAddress, proposalId, mode, userAddress);
  } else {
    return voteGamma(poolAddress, proposalId, mode);
  }
}

export function voteFor(address, proposalId, userAddress, version) {
  return vote(address, proposalId, 1, userAddress, version);
}

export function voteAgainst(address, proposalId, userAddress, version) {
  return vote(address, proposalId, 2, userAddress, version);
}

export function hasVoted(poolAddress, proposalId, address, version) {
  if (version > 4) {
    return hasVotedEpsilon(poolAddress, proposalId, address);
  } else if (version > 3) {
    return hasVotedDelta(poolAddress, proposalId, address);
  } else {
    return hasVotedGamma(poolAddress, proposalId, address);
  }
}
