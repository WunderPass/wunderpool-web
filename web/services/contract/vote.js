import { voteDelta } from './delta/vote';
import { voteGamma } from './gamma/vote';

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
