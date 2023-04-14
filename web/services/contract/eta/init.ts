import { SupportedChain } from './../types';
import { ethers } from 'ethers';
import { httpProvider } from '../../../services/contract/provider';

function proposalAddress(chain: SupportedChain) {
  if (chain == 'polygon') return '0x2B0b5B7FB37cA2446af4ADca724224dd1f4d71c6';
  if (chain == 'gnosis') return '0xb1c89138F7dfD02E84f402717B3388B6125177CE';
  throw `Unsupported Chain: ${chain}`;
}

export function initProposalEta(
  chain: SupportedChain
): [ethers.Contract, ethers.providers.JsonRpcProvider] {
  const abi = [
    'function calculateVotes(address _pool, uint256 _proposalId) view returns (uint256 yesVotes, uint256 noVotes, uint256 yesVoters, uint256 noVoters)',
    'function getProposal(address _pool, uint256 _proposalId) view returns (string title, string description, uint256 transactionCount, uint256 deadline, uint256 yesVotes, uint256 noVotes, uint256 totalVotes, uint256 createdAt, bool executed, address creator)',
    'function getProposalTransaction(address _pool, uint256 _proposalId, uint256 _transactionIndex) view returns (string action, bytes param, uint256 transactionValue, address contractAddress)',
    'function hasVoted(address _pool, uint256 _proposalId, address _account) view returns (uint8)',
    'function proposalExecutable(address _pool, uint256 _proposalId) view returns (bool executable, string errorMessage)',
  ];
  const provider = httpProvider(chain);
  return [new ethers.Contract(proposalAddress(chain), abi, provider), provider];
}
