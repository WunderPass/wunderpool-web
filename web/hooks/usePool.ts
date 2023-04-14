import { BettingCompetitionsResponse } from './../pages/api/betting/competitions/index';
import { VersionInfo, FormattedProposal } from './../services/contract/types';
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import {
  isMember,
  joinPool,
  addToWhiteList,
  fetchPoolData,
  fetchPoolBalance,
  addToWhiteListWithSecret,
  formatMembers,
  FormattedPoolMember,
  FormattedAsset,
  formatGovernanceToken,
  FormattedGovernanceToken,
} from '../services/contract/pools';
import {
  createApeSuggestion,
  createFudSuggestion,
  fetchPoolProposals,
  createLiquidateSuggestion,
  createSwapSuggestion,
  executeProposal,
  proposalExecutable,
} from '../services/contract/proposals';
import { vote, voteAgainst, voteFor } from '../services/contract/vote';
import {
  latestVersion,
  usdcAddress,
  versionLookup,
} from '../services/contract/init';
import axios from 'axios';
import { formatAsset } from '../services/contract/pools';
import { compAddr } from '../services/memberHelpers';
import { UseNotification } from './useNotification';
import { FormattedCompetition } from '../services/bettingHelpers';

type LoadingState = {
  init: boolean;
  members: boolean;
  tokens: boolean;
  proposals: boolean;
  bets: boolean;
};

export type UsePoolTypes = {
  isReady: boolean;
  loadingState: LoadingState;
  exists: boolean;
  closed: boolean;
  liquidated: boolean;
  isPublic: boolean;
  poolName: string;
  poolDescription: string;
  version: VersionInfo;
  poolAddress: string;
  minInvest: number;
  maxInvest: number;
  maxMembers: number;
  minYesVoters: number;
  votingThreshold: number;
  votingTime: number;
  setPoolAddress: Dispatch<SetStateAction<string>>;
  userAddress: string;
  setUserAddress: Dispatch<SetStateAction<string>>;
  updateUserAddress: (addr: string) => void;
  userShare: number;
  resolveMember: (address: string) => string;
  resolveProposal: (proposalId: number) => FormattedProposal;
  members: FormattedPoolMember[];
  isMember: boolean;
  join: (amount: number, secret?: string) => Promise<unknown>;
  inviteUser: (newMember: string) => Promise<unknown>;
  createInviteLink: (secret: string, validFor: number) => Promise<unknown>;
  usdcBalance: number;
  assetBalance: number;
  totalBalance: number;
  assetCount: number;
  tokens: FormattedAsset[];
  bettingCompetitions: FormattedCompetition[];
  governanceToken: FormattedGovernanceToken;
  proposals: FormattedProposal[];
  determinePoolData: () => Promise<{
    vers: VersionInfo;
    exists: boolean;
    isMem: boolean;
  }>;
  apeSuggestion: (
    tokenAddress: string,
    title: string,
    description: string,
    value: string
  ) => Promise<unknown>;
  fudSuggestion: (
    tokenAddress: string,
    tokenDecimals: number,
    title: string,
    description: string,
    value: string
  ) => Promise<unknown>;
  swapSuggestion: (
    tokenIn: string,
    tokenInDecimals: number,
    tokenOut: string,
    title: string,
    description: string,
    amount: string
  ) => Promise<unknown>;
  liquidateSuggestion: (title: string, description: string) => Promise<unknown>;
  vote: (proposalId: number, mode: number) => Promise<unknown>;
  voteForProposal: (proposalId: number) => Promise<unknown>;
  voteAgainstProposal: (proposalId: number) => Promise<unknown>;
  executable: (id: number) => Promise<unknown>;
  execute: (id: number) => Promise<unknown>;
  determineTokens: () => Promise<FormattedAsset[]>;
  determineBettingCompetitions: () => Promise<void>;
  determineProposals: (vers?: VersionInfo) => Promise<void>;
  determineBalance: () => Promise<void>;
};

export default function usePool(
  userAddr: string,
  poolAddr = null,
  handleError: UseNotification.handleError
): UsePoolTypes {
  const [isReady, setIsReady] = useState(false);
  const [loadingState, setLoadingState] = useState({
    init: false,
    members: false,
    tokens: false,
    proposals: false,
    bets: false,
  });

  const [userAddress, setUserAddress] = useState(userAddr);
  const [poolAddress, setPoolAddress] = useState<string>(poolAddr);
  const [poolName, setPoolName] = useState<string>(null);
  const [poolDescription, setPoolDescription] = useState(null);
  const [exists, setExists] = useState(null);
  const [closed, setClosed] = useState(null);
  const [liquidated, setLiquidated] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [version, setVersion] = useState<VersionInfo | undefined>(undefined);
  const [poolMembers, setPoolMembers] = useState<FormattedPoolMember[]>([]);
  const [userIsMember, setUserIsMember] = useState<boolean>(null);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [assetBalance, setAssetBalance] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [poolTokens, setPoolTokens] = useState<FormattedAsset[]>([]);
  const [poolGovernanceToken, setPoolGovernanceToken] =
    useState<FormattedGovernanceToken>(null);
  const [poolProposals, setPoolProposals] = useState<FormattedProposal[]>([]);
  const [bettingCompetitions, setBettingCompetitions] = useState<
    FormattedCompetition[]
  >([]);

  const [minInvest, setMinInvest] = useState<number>();
  const [maxInvest, setMaxInvest] = useState<number>();
  const [maxMembers, setMaxMembers] = useState<number>();
  const [minYesVoters, setMinYesVoter] = useState<number>();
  const [votingThreshold, setVotingThreshold] = useState<number>();
  const [votingTime, setVotingTime] = useState<number>();

  const userShare = useMemo(() => {
    if (!poolMembers || poolMembers.length <= 0) return 0;
    return (
      poolMembers.find((m) => compAddr(m.address, userAddress))?.share || 0
    );
  }, [poolMembers]);

  const updateLoadingState = (key, loaded = true, timeout = 0) => {
    setTimeout(() => {
      setLoadingState((state) => ({ ...state, [key]: loaded }));
    }, timeout);
  };

  const resolveMember = (address: string) => {
    if (compAddr(address, poolAddress)) return poolName;
    return (
      poolMembers.find((m) => compAddr(m.address, address))?.userName || address
    );
  };

  const resolveProposal = (proposalId: number) => {
    return poolProposals.find((p) => p.id == proposalId);
  };

  const join = async (amount: number, secret = '') => {
    if (!version || userIsMember) return;
    return joinPool(
      poolAddress,
      userAddress,
      amount,
      secret,
      version?.number,
      version.chain
    );
  };

  const updateUserAddress = (addr: string) => {
    setUserAddress(addr);
    determineIfMember(addr);
  };

  const inviteUser = (newMember: string) => {
    return addToWhiteList(poolAddress, userAddress, newMember, version?.number);
  };

  const createInviteLink = (secret: string, validFor: number) => {
    return addToWhiteListWithSecret(
      poolAddress,
      userAddress,
      secret,
      validFor,
      version?.number
    );
  };

  const apeSuggestion = (
    tokenAddress: string,
    title: string,
    description: string,
    value: string
  ) => {
    return createApeSuggestion(
      poolAddress,
      tokenAddress,
      title,
      description,
      value,
      userAddress,
      version?.number,
      version?.chain
    );
  };

  const fudSuggestion = (
    tokenAddress: string,
    tokenDecimals: number,
    title: string,
    description: string,
    value: string
  ) => {
    return createFudSuggestion(
      poolAddress,
      tokenAddress,
      tokenDecimals,
      title,
      description,
      value,
      userAddress,
      version?.number,
      version?.chain
    );
  };

  const swapSuggestion = (
    tokenIn: string,
    tokenInDecimals: number,
    tokenOut: string,
    title: string,
    description: string,
    amount: string
  ) => {
    return createSwapSuggestion(
      poolAddress,
      tokenIn,
      tokenInDecimals,
      tokenOut,
      title,
      description,
      amount,
      userAddress,
      version?.number
    );
  };

  const liquidateSuggestion = (title: string, description: string) => {
    return createLiquidateSuggestion(
      poolAddress,
      title,
      description,
      userAddress,
      version?.number
    );
  };

  const executable = (id: number) => {
    return proposalExecutable(poolAddress, id, version?.number);
  };

  const execute = (id: number) => {
    return new Promise(async (resolve, reject) => {
      executeProposal(poolAddress, id, version?.number, version.chain)
        .then((isLiquidate) => {
          setClosed(true);
          setLiquidated(isLiquidate);
          resolve(isLiquidate);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const determineIfMember = async (addr: string = null) => {
    const userAddr = userAddress || addr;
    if (!userAddr) return false;
    setUserIsMember(await isMember(poolAddress, userAddr));
  };

  const determineUsdcBalance = async () => {
    setUsdcBalance(await fetchPoolBalance(poolAddress));
  };

  const determineCustomBalances = (tokens: FormattedAsset[] = null) => {
    let totalBalance = 0;
    let assetBalance = 0;
    let assetCount = 0;
    (tokens || poolTokens)
      .filter((tkn) => tkn.balance > 0)
      .forEach((token) => {
        totalBalance += token.usdValue;
        if (token.address !== usdcAddress(version.chain)) {
          assetBalance += token.usdValue;
          assetCount++;
        }
      });

    setAssetBalance(assetBalance);
    setTotalBalance(totalBalance);
    setAssetCount(assetCount);
  };

  const determinePoolTokens = async () => {
    if (liquidated) return;
    //Timeout wird gebraucht weil backend langsamer ist als frontend (events in zukunft?)
    const toks: FormattedAsset[] = await new Promise((res, rej) => {
      setTimeout(async () => {
        try {
          const { pool_treasury, pool_assets } = await fetchPoolData(
            poolAddress
          );
          setUsdcBalance(pool_treasury.act_balance);

          const tokens = await Promise.all(
            pool_assets.map(async (asset) => {
              return await formatAsset(asset);
            })
          );
          setPoolTokens(tokens);
          determineCustomBalances(tokens);
          updateLoadingState('tokens');
          res(tokens);
        } catch (error) {
          rej(error);
        }
      }, 2000);
    });
    return toks;
  };

  const determinePoolBettingCompetitions = async () => {
    try {
      updateLoadingState('bets', false);
      const { data }: { data: BettingCompetitionsResponse } = await axios({
        url: '/api/betting/competitions',
        params: {
          poolAddress,
          states: 'HISTORIC,UPCOMING,LIVE',
          chain: version.chain,
        },
      });
      setBettingCompetitions(data.content);
      updateLoadingState('bets');
    } catch (error) {
      handleError('Could not load Games');
      updateLoadingState('bets');
    }
  };

  const determinePoolProposals = async (vers: VersionInfo = null) => {
    //Timeout wird gebraucht weil backend langsamer ist als frontend (events in zukunft?)
    setTimeout(async () => {
      if (liquidated) return;
      updateLoadingState('proposals', false);
      try {
        const proposals = await fetchPoolProposals(
          poolAddress,
          userAddress,
          (vers || version)?.number
        );
        setPoolProposals(proposals);
      } catch (error) {
        handleError('Proposals could not be loaded');
        console.log('ERROR fetching Proposals', error);
      }
      updateLoadingState('proposals');
    }, 2000);
  };

  const voteWithMode = (proposalId: number, mode: number) => {
    return vote(
      poolAddress,
      proposalId,
      mode,
      userAddress,
      version?.number,
      version.chain
    );
  };

  const voteForProposal = (proposalId: number) => {
    return voteFor(
      poolAddress,
      proposalId,
      userAddress,
      version?.number,
      version.chain
    );
  };

  const voteAgainstProposal = (proposalId: number) => {
    return voteAgainst(
      poolAddress,
      proposalId,
      userAddress,
      version?.number,
      version.chain
    );
  };

  const determinePoolData = async () => {
    setLoadingState((state) => ({
      ...state,
      init: false,
      members: false,
      tokens: false,
    }));

    try {
      const {
        launcher,
        pool_name,
        pool_description,
        public: public_pool,
        pool_creator,
        pool_members,
        shareholder_agreement,
        active,
        closed,
        pool_treasury,
        pool_shares,
        pool_assets,
      } = await fetchPoolData(poolAddress);

      setPoolName(pool_name);
      setExists(active);
      const vers = versionLookup[launcher.launcher_version?.toLowerCase()];
      setVersion(vers);
      setClosed(closed);
      setIsPublic(public_pool);

      setMinInvest(shareholder_agreement?.min_invest);
      setMaxInvest(shareholder_agreement?.max_invest);
      setMaxMembers(shareholder_agreement?.max_members);
      setMinYesVoter(shareholder_agreement?.min_yes_voters);
      setVotingThreshold(shareholder_agreement?.voting_threshold);
      setVotingTime(shareholder_agreement?.voting_time);

      setPoolDescription(pool_description);
      setUsdcBalance(pool_treasury.act_balance);

      const isMem =
        pool_members.filter((m) => compAddr(m.members_address, userAddress))
          .length > 0;

      setUserIsMember(isMem);

      const totalShares = pool_shares.emmited_shares;

      setPoolGovernanceToken(formatGovernanceToken(pool_shares));
      updateLoadingState('init');

      const formattedMembers = await formatMembers(
        pool_members,
        totalShares,
        false
      );

      setPoolMembers(formattedMembers);
      updateLoadingState('members');

      const tokens = await Promise.all(
        pool_assets.map(async (asset) => {
          return await formatAsset(asset);
        })
      );

      setPoolTokens(tokens);
      determineCustomBalances(tokens);
      updateLoadingState('tokens');

      return { vers, exists: active, isMem };
    } catch (error) {
      throw error;
    }
  };

  const initialize = async () => {
    if (poolAddress) {
      await determinePoolData()
        .then(async ({ vers, exists }) => {
          if (exists) {
            await determinePoolBettingCompetitions();
            await determinePoolProposals(vers);
          }
        })
        .catch((err) => {
          setExists(false);
          console.log(err);
        });
    } else {
      setVersion(latestVersion);
    }
  };

  useEffect(() => {
    setLoadingState((prevState) => {
      const newState = { ...prevState };
      Object.keys(newState).forEach((key) => {
        newState[key] = false;
      });
      return newState;
    });
    setVersion(undefined);
    setIsReady(false);
    initialize().then(() => {
      setIsReady(true);
    });
  }, [poolAddress, userAddress]);

  return {
    isReady,
    loadingState,
    exists,
    closed,
    liquidated,
    isPublic,
    poolName,
    poolDescription,
    version,
    poolAddress,
    minInvest,
    maxInvest,
    maxMembers,
    minYesVoters,
    votingThreshold,
    votingTime,
    setPoolAddress,
    userAddress,
    setUserAddress,
    updateUserAddress,
    userShare,
    resolveMember,
    resolveProposal,
    members: poolMembers,
    isMember: userIsMember,
    join,
    inviteUser,
    createInviteLink,
    usdcBalance,
    assetBalance,
    totalBalance,
    assetCount,
    tokens: poolTokens,
    bettingCompetitions,
    governanceToken: poolGovernanceToken,
    proposals: poolProposals,
    determinePoolData,
    apeSuggestion,
    fudSuggestion,
    swapSuggestion,
    liquidateSuggestion,
    vote: voteWithMode,
    voteForProposal,
    voteAgainstProposal,
    executable,
    execute,
    determineTokens: determinePoolTokens,
    determineBettingCompetitions: determinePoolBettingCompetitions,
    determineProposals: determinePoolProposals,
    determineBalance: determineUsdcBalance,
  };
}
