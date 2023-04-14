import { SupportedChain } from './types';
import { voteDelta } from './delta/vote';
import { voteGamma } from './gamma/vote';

export function vote(
  poolAddress: string,
  proposalId: number,
  mode: number,
  userAddress: string,
  version: number,
  chain: SupportedChain
) {
  if (version > 3) {
    return voteDelta(poolAddress, proposalId, mode, userAddress, chain);
  } else {
    return voteGamma(poolAddress, proposalId, mode);
  }
}

export function voteFor(
  address: string,
  proposalId: number,
  userAddress: string,
  version: number,
  chain: SupportedChain
) {
  return vote(address, proposalId, 1, userAddress, version, chain);
}

export function voteAgainst(
  address: string,
  proposalId: number,
  userAddress: string,
  version: number,
  chain: SupportedChain
) {
  return vote(address, proposalId, 2, userAddress, version, chain);
}
