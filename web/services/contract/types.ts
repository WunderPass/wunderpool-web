import { ProposalsResponse } from './../../pages/api/proposals/index';
export type SupportedChain = 'polygon' | 'gnosis';
export type SupportedDistributorVersion = 'ALPHA' | 'BETA' | 'GAMMA';
export type SupportedPoolVersion =
  | 'GAMMA'
  | 'DELTA'
  | 'EPSILON'
  | 'ZETA'
  | 'ETA';

export type SupportedPayoutRule = 'PROPORTIONAL' | 'WINNER_TAKES_IT_ALL';

export type TransactionData = {
  action: any;
  params: any;
  transactionValue: any;
  contractAddress: any;
};

export type VersionInfo = {
  name: string;
  number: number;
  chain?: SupportedChain;
};

export type FormattedProposal = {
  id: number;
  title: string;
  description: string;
  transactionCount?: number;
  action?: ProposalsResponse[number]['proposal_action'];
  deadline: number;
  votings?: ProposalsResponse[number]['votings'];
  createdAt: number;
  executed: boolean;
  executable: boolean;
  declined: boolean;
  creator?: string;
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  hasVoted: 0 | 1 | 2;
};
