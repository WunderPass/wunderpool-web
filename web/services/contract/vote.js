import {
  hasVotedDelta,
  voteAgainstDelta,
  voteDelta,
  voteForDelta,
} from './delta/vote';
import { hasVotedEpsilon } from './epsilon/vote';
import {
  hasVotedGamma,
  voteAgainstGamma,
  voteForGamma,
  voteGamma,
} from './gamma/vote';

export function vote(poolAddress, proposalId, mode, userAddress, version) {
  if (version > 3) {
    return voteDelta(poolAddress, proposalId, mode, userAddress);
  } else {
    return voteGamma(poolAddress, proposalId, mode);
  }
}

export function voteFor(address, proposalId, userAddress, version) {
  if (version > 3) {
    return voteForDelta(address, proposalId, userAddress);
  } else {
    return voteForGamma(address, proposalId);
  }
}

export function voteAgainst(address, proposalId, userAddress, version) {
  if (version > 3) {
    return voteAgainstDelta(address, proposalId, userAddress);
  } else {
    return voteAgainstGamma(address, proposalId);
  }
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
