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
import { isLiquidateProposal } from '../services/contract/proposals';
import { addToWhiteListWithSecret } from '../services/contract/pools';

export default function usePool(userAddr, poolAddr = null) {
  const userAddress = userAddr;
  const [poolAddress, setPoolAddress] = useState(poolAddr);
  const [isReady, setIsReady] = useState(false);
  const [isReady2, setIsReady2] = useState(false);
  const [poolName, setPoolName] = useState(null);
  const [exists, setExists] = useState(true);
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

  const join = async (amount) => {
    if (!version || userIsMember) return;
    joinPool(poolAddress, userAddress, amount, version.number)
      .then((res) => {
        waitForTransaction(res)
          .then((tx) => {
            window.location.reload();
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        throw err;
      });
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

  const execute = (id) => {
    setClosed(true);
    return new Promise(async (resolve, reject) => {
      const isLiquidate = await isLiquidateProposal(
        poolAddress,
        id,
        version.number
      );
      executeProposal(poolAddress, id, version.number)
        .then((res) => {
          setLiquidated(isLiquidate);
          resolve(isLiquidate);
        })
        .catch((err) => {
          reject(err);
        });
    });
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
    tokens
      .filter((tkn) => tkn.balance > 0)
      .map((token, i) => {
        if (token.address && token.address.length == 42) {
          axios({
            url: `/api/tokens/show`,
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
    if (liquidated) return;
    const tokens = await fetchPoolTokens(poolAddress, version.number);
    setPoolTokens(tokens);
    return tokens;
  };

  const determinePoolNfts = async () => {
    if (liquidated) return;
    setPoolNfts(await fetchPoolNfts(poolAddress, version.number));
  };

  const determinePoolGovernanceToken = async () => {
    if (liquidated) return;
    setPoolGovernanceToken(
      await fetchPoolGovernanceToken(poolAddress, version.number)
    );
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
    if (!poolGovernanceToken) return;
    return poolGovernanceToken?.holders
      ?.find(
        (holder) => holder.address.toLowerCase() == userAddress.toLowerCase()
      )
      ?.share?.toNumber();
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

  const initialize2 = async () => {
    if (poolAddress) {
      await determinePoolGovernanceToken();
      if (userIsMember === true) {
        await determinePoolNfts();
        await determinePoolProposals();
      }
    }
  };
  useEffect(() => {
    setIsReady2(false);
    initialize2().then(() => {
      setIsReady2(true);
    });
  }, [poolAddress, userIsMember]);

  useEffect(() => {
    setIsReady(false);
    initialize().then(() => {
      setIsReady(true);
    });
  }, [poolAddress]);

  return {
    isReady,
    isReady2,
    exists,
    closed,
    liquidated,
    poolName,
    version,
    poolAddress,
    setPoolAddress,
    userAddress,
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
    execute,
    determineIfMember,
    determineTokens: determinePoolTokens,
    determineNfts: determinePoolNfts,
    determineProposals: determinePoolProposals,
    determineBalance: determineUsdcBalance,
  };
}
