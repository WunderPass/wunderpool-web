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
  createPool,
  joinPool,
  fetchPoolBalance,
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
import { waitForTransaction } from '/services/contract/provider';
import axios from 'axios';
import { usdcAddress } from '/services/contract/init';

export default function usePool(userAddr, poolAddr = null) {
  const userAddress = userAddr;
  const [poolAddress, setPoolAddress] = useState(poolAddr);
  const [isReady, setIsReady] = useState(false);
  const [poolName, setPoolName] = useState(null);
  const [exists, setExists] = useState(true);
  const [closed, setClosed] = useState(null);
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

  const newPool = async (
    poolName,
    entryBarrier,
    tokenName,
    tokenSymbol,
    tokenPrice
  ) => {
    createPool(
      poolName,
      entryBarrier,
      tokenName,
      tokenSymbol,
      tokenPrice,
      userAddress
    );
  };

  const join = async (amount) => {
    if (!version || userIsMember) return;
    joinPool(poolAddress, userAddress, amount, version.number)
      .then((res) => {
        waitForTransaction(res)
          .then(() => {
            return true;
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
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

  const execute = (id) => {
    return executeProposal(poolAddress, id, version.number);
  };

  const determineClosed = async (vers) => {
    setClosed(await fetchPoolIsClosed(poolAddress, vers.number));
  };

  const determineVersion = async () => {
    const vers = await poolVersion(poolAddress);
    setVersion(vers);
    return vers;
  };

  const determineIfMember = async () => {
    setUserIsMember(await isMember(poolAddress, userAddress));
  };

  const determineUsdcBalance = async () => {
    setUsdcBalance(await fetchPoolBalance(poolAddress));
  };

  const determineCustomBalances = async (tokens) => {
    var totalBalance = 0;
    var assetBalance = 0;
    var curAssetBalance = 0;
    var assetCount = 0;
    tokens.map((token, i) => {
      if (token.address && token.address.length == 42) {
        axios({
          url: `/api/tokens/showPrice`,
          params: { address: token.address },
        }).then((res) => {
          var tokenPrice = res.data?.dollar_price;
          curAssetBalance = token.formattedBalance * tokenPrice;
          totalBalance += curAssetBalance;
          if (token.address !== usdcAddress) {
            assetBalance += curAssetBalance;
            assetCount++;
          }
          setAssetBalance(assetBalance);
          setTotalBalance(totalBalance);
          setAssetCount(assetCount);
        });
      }
    });
  };

  const determinePoolTokens = async () => {
    const tokens = await fetchPoolTokens(poolAddress, version.number);
    setPoolTokens(tokens);
    return tokens;
  };

  const determinePoolNfts = async () => {
    setPoolNfts(await fetchPoolNfts(poolAddress, version.number));
  };

  const determinePoolGovernanceToken = async () => {
    setPoolGovernanceToken(
      await fetchPoolGovernanceToken(poolAddress, version.number)
    );
  };

  const determinePoolProposals = async () => {
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

  const initialize = async () => {
    if (poolAddress) {
      await fetchPoolName(poolAddress)
        .then(async (name) => {
          setPoolName(name);
          setExists(true);
          await determineClosed(await determineVersion());
          await determineIfMember();
          await determineUsdcBalance();

          const tokens = await determinePoolTokens();
          await determineCustomBalances(tokens);
        })
        .catch((err) => {
          setExists(false);
          console.log(err);
        });
    } else {
      setVersion(latestVersion);
    }
  };

  useEffect(async () => {
    if (userIsMember === true) {
      await determinePoolTokens();
      await determinePoolNfts();
      await determinePoolGovernanceToken();
      await determinePoolProposals();
    } else if (userIsMember === false) {
      await determinePoolGovernanceToken();
    }
  }, [userIsMember]);

  useEffect(() => {
    setIsReady(false);
    initialize().then(() => {
      setIsReady(true);
    });
  }, [poolAddress]);

  return {
    isReady,
    exists,
    closed,
    poolName,
    version,
    poolAddress,
    setPoolAddress,
    userAddress,
    isMember: userIsMember,
    newPool,
    join,
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
    execute,
    determineIfMember,
    determineTokens: determinePoolTokens,
    determineNfts: determinePoolNfts,
    determineProposals: determinePoolProposals,
    determineBalance: determineUsdcBalance,
  };
}
