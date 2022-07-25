import { useState, useEffect } from 'react';
import {
  fetchPoolGovernanceToken,
  fetchPoolNfts,
  fetchPoolTokens,
} from '/services/contract/token';
import {
  fetchPoolName,
  isMember,
  fetchPoolIsClosed,
  poolVersion,
  joinPool,
  addToWhiteList,
  fetchPoolBalance,
  fetchPoolShareholderAgreement,
} from '/services/contract/pools';
import {
  createApeSuggestion,
  createFudSuggestion,
  fetchPoolProposals,
  fetchTransactionData,
  createLiquidateSuggestion,
  createSwapSuggestion,
  executeProposal,
} from '/services/contract/proposals';
import { hasVoted, vote, voteAgainst, voteFor } from '/services/contract/vote';
import { latestVersion } from '/services/contract/init';
import { usdcAddress } from '/services/contract/init';
import {
  isLiquidateProposal,
  proposalExecutable,
} from '/services/contract/proposals';
import { addToWhiteListWithSecret } from '../services/contract/pools';

export default function usePool(userAddr, poolAddr = null) {
  const [userAddress, setUserAddress] = useState(userAddr);
  const [poolAddress, setPoolAddress] = useState(poolAddr);
  const [isReady, setIsReady] = useState(false);
  const [isReady2, setIsReady2] = useState(false);
  const [poolName, setPoolName] = useState(null);
  const [exists, setExists] = useState(null);
  const [closed, setClosed] = useState(null);
  const [liquidated, setLiquidated] = useState(false);
  const [version, setVersion] = useState(null);
  const [userIsMember, setUserIsMember] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [assetBalance, setAssetBalance] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [poolTokens, setPoolTokens] = useState([]);
  const [poolNfts, setPoolNfts] = useState([]);
  const [poolGovernanceToken, setPoolGovernanceToken] = useState(null);
  const [poolProposals, setPoolProposals] = useState([]);

  const [minInvest, setMinInvest] = useState('');
  const [maxInvest, setMaxInvest] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [minYesVoters, setMinYesVoter] = useState('');
  const [votingThreshold, setVotingThreshold] = useState('');
  const [votingTime, setVotingTime] = useState('');

  const join = async (amount, secret = '') => {
    if (!version || userIsMember) return;
    return joinPool(poolAddress, userAddress, amount, secret, version.number);
  };

  const updateUserAddress = (addr) => {
    setUserAddress(addr);
    determineIfMember(addr);
  };

  const inviteUser = (newMember) => {
    return addToWhiteList(poolAddress, userAddress, newMember, version.number);
  };

  const createInviteLink = (secret, validFor) => {
    return addToWhiteListWithSecret(
      poolAddress,
      userAddress,
      secret,
      validFor,
      version.number
    );
  };

  const apeSuggestion = (tokenAddress, title, description, value) => {
    return createApeSuggestion(
      poolAddress,
      tokenAddress,
      title,
      description,
      value,
      userAddress,
      version.number
    );
  };

  const fudSuggestion = (tokenAddress, title, description, value) => {
    return createFudSuggestion(
      poolAddress,
      tokenAddress,
      title,
      description,
      value,
      userAddress,
      version.number
    );
  };

  const swapSuggestion = (tokenIn, tokenOut, title, description, amount) => {
    return createSwapSuggestion(
      poolAddress,
      tokenIn,
      tokenOut,
      title,
      description,
      amount,
      userAddress,
      version.number
    );
  };

  const liquidateSuggestion = (title, description) => {
    return createLiquidateSuggestion(
      poolAddress,
      title,
      description,
      userAddress,
      version.number
    );
  };

  const executable = (id) => {
    return proposalExecutable(poolAddress, id, version.number);
  };

  const execute = (id) => {
    return new Promise(async (resolve, reject) => {
      const isLiquidate = await isLiquidateProposal(
        poolAddress,
        id,
        version.number
      );
      executeProposal(poolAddress, id, version.number)
        .then((res) => {
          setClosed(true);
          setLiquidated(isLiquidate);
          resolve(isLiquidate);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const determineClosed = async (vers = null) => {
    setClosed(await fetchPoolIsClosed(poolAddress, (vers || version).number));
  };

  const determineVersion = async () => {
    const vers = await poolVersion(poolAddress);
    setVersion(vers);
    return vers;
  };

  const determineIfMember = async (addr = null) => {
    const userAddr = userAddress || addr;
    if (!userAddr) return false;
    setUserIsMember(await isMember(poolAddress, userAddr));
  };

  const determineUsdcBalance = async () => {
    setUsdcBalance(await fetchPoolBalance(poolAddress));
  };

  const determineShareholderAgreement = async (vers = null) => {
    const shareholderAgreement = await fetchPoolShareholderAgreement(
      poolAddress,
      (vers || version).number
    );

    setMinInvest(shareholderAgreement.min_invest);
    setMaxInvest(shareholderAgreement.max_invest);
    setMaxMembers(shareholderAgreement.max_members);
    setMinYesVoter(shareholderAgreement.min_yes_voters);
    setVotingThreshold(shareholderAgreement.voting_threshold);
    setVotingTime(shareholderAgreement.voting_time);
  };

  const determineCustomBalances = (tokens = null) => {
    let totalBalance = 0;
    let assetBalance = 0;
    let assetCount = 0;
    (tokens || poolTokens)
      .filter((tkn) => tkn.balance > 0)
      .forEach((token) => {
        totalBalance += token.usdValue;
        if (token.address !== usdcAddress) {
          assetBalance += token.usdValue;
          assetCount++;
        }
      });
    setAssetBalance(assetBalance);
    setTotalBalance(totalBalance);
    setAssetCount(assetCount);
  };

  const determinePoolTokens = async (vers = null) => {
    if (liquidated) return;
    const tokens = await fetchPoolTokens(poolAddress, (vers || version).number);
    setPoolTokens(tokens);
    determineCustomBalances(tokens);
    return tokens;
  };

  const determinePoolNfts = async () => {
    if (liquidated) return;
    setPoolNfts(await fetchPoolNfts(poolAddress, version.number));
  };

  const determinePoolGovernanceToken = async (vers = null) => {
    if (liquidated) return;
    const tkn = await fetchPoolGovernanceToken(
      poolAddress,
      (vers || version).number
    );
    setPoolGovernanceToken(tkn);
  };

  const determinePoolProposals = async () => {
    if (liquidated) return;
    setPoolProposals(await fetchPoolProposals(poolAddress, version.number));
  };

  const getTransactionData = async (id, transactionCount) => {
    return await fetchTransactionData(
      poolAddress,
      id,
      transactionCount,
      version.number
    );
  };

  const voteWithMode = (proposalId, mode) => {
    return vote(poolAddress, proposalId, mode, userAddress, version.number);
  };

  const voteForProposal = (proposalId) => {
    return voteFor(poolAddress, proposalId, userAddress, version.number);
  };

  const voteAgainstProposal = (proposalId) => {
    return voteAgainst(poolAddress, proposalId, userAddress, version.number);
  };

  const userHasVoted = (proposalId) => {
    return hasVoted(poolAddress, proposalId, userAddress, version.number);
  };

  const userShare = () => {
    if (!poolGovernanceToken || !poolGovernanceToken.holders) return 0;
    return poolGovernanceToken.holders
      ?.find(
        (holder) => holder?.address?.toLowerCase() == userAddress.toLowerCase()
      )
      ?.share?.toNumber();
  };

  const initialize = async () => {
    if (poolAddress) {
      await fetchPoolName(poolAddress)
        .then(async (name) => {
          setPoolName(name);
          setExists(true);
          const vers = await determineVersion();

          await determineClosed(vers);
          await determineUsdcBalance();
          await determineShareholderAgreement(vers);
          await determinePoolTokens(vers);

          if (userAddress) {
            await determineIfMember();
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

  const initialize2 = async () => {
    if (poolAddress && exists) {
      const vers = await determineVersion();
      await determinePoolGovernanceToken(vers);
      if (userIsMember === true) {
        await determinePoolNfts();
        await determinePoolProposals();
      }
    }
  };

  useEffect(() => {
    if (!version) return;
    setIsReady2(false);
    initialize2().then(() => {
      setIsReady2(true);
    });
  }, [poolAddress, userIsMember]);

  useEffect(() => {
    setVersion(null);
    setIsReady(false);
    initialize().then(() => {
      setIsReady(true);
    });
  }, [poolAddress, userAddress]);

  return {
    isReady,
    isReady2,
    exists,
    closed,
    liquidated,
    poolName,
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
    isMember: userIsMember,
    join,
    inviteUser,
    createInviteLink,
    usdcBalance,
    assetBalance,
    totalBalance,
    assetCount,
    tokens: poolTokens,
    nfts: poolNfts,
    governanceToken: poolGovernanceToken,
    proposals: poolProposals,
    getTransactionData,
    apeSuggestion,
    fudSuggestion,
    swapSuggestion,
    liquidateSuggestion,
    vote: voteWithMode,
    voteForProposal,
    voteAgainstProposal,
    userHasVoted,
    executable,
    execute,
    determineIfMember,
    determineTokens: determinePoolTokens,
    determineNfts: determinePoolNfts,
    determineProposals: determinePoolProposals,
    determineGovernanceToken: determinePoolGovernanceToken,
    determineBalance: determineUsdcBalance,
    determineShareholderAgreement,
  };
}
