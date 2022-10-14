import { useState, useEffect, useMemo } from 'react';
import { fetchPoolNfts } from '/services/contract/token';
import {
  isMember,
  joinPool,
  addToWhiteList,
  fetchPoolData,
  fetchPoolBalance,
  addToWhiteListWithSecret,
} from '/services/contract/pools';
import {
  createApeSuggestion,
  createFudSuggestion,
  fetchPoolProposals,
  fetchTransactionData,
  createLiquidateSuggestion,
  createSwapSuggestion,
  executeProposal,
  proposalExecutable,
  createNftSellProposal,
  createNftBuyProposal,
} from '/services/contract/proposals';
import { vote, voteAgainst, voteFor } from '/services/contract/vote';
import {
  latestVersion,
  usdcAddress,
  versionLookup,
} from '/services/contract/init';
import { cacheItemDB, getCachedItemDB } from '/services/caching';
import axios from 'axios';
import { formatAsset } from '../services/contract/pools';

export default function usePool(
  userAddr,
  poolAddr = null,
  handleError = () => {}
) {
  const [isReady, setIsReady] = useState(false);
  const [loadingState, setLoadingState] = useState({
    init: false,
    members: false,
    tokens: false,
    proposals: false,
    bets: false,
  });

  const [userAddress, setUserAddress] = useState(userAddr);
  const [poolAddress, setPoolAddress] = useState(poolAddr);
  const [poolName, setPoolName] = useState(null);
  const [poolDescription, setPoolDescription] = useState(null);
  const [exists, setExists] = useState(null);
  const [closed, setClosed] = useState(null);
  const [liquidated, setLiquidated] = useState(false);
  const [version, setVersion] = useState(null);
  const [poolMembers, setPoolMembers] = useState([]);
  const [userIsMember, setUserIsMember] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [assetBalance, setAssetBalance] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [assetCount, setAssetCount] = useState(0);
  const [poolTokens, setPoolTokens] = useState([]);
  const [poolNfts, setPoolNfts] = useState([]);
  const [poolGovernanceToken, setPoolGovernanceToken] = useState(null);
  const [poolProposals, setPoolProposals] = useState([]);
  const [bettingGames, setBettingGames] = useState([]);

  const [minInvest, setMinInvest] = useState('');
  const [maxInvest, setMaxInvest] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [minYesVoters, setMinYesVoter] = useState('');
  const [votingThreshold, setVotingThreshold] = useState('');
  const [votingTime, setVotingTime] = useState('');

  const userShare = useMemo(() => {
    if (!poolMembers || poolMembers.length <= 0) return 0;
    return (
      poolMembers.find(
        (m) => m.address.toLowerCase() == userAddress?.toLowerCase()
      )?.share || 0
    );
  }, [poolMembers]);

  const updateLoadingState = (key, loaded = true, timeout = 0) => {
    setTimeout(() => {
      setLoadingState((state) => ({ ...state, [key]: loaded }));
    }, timeout);
  };

  const resolveMember = (address) => {
    if (address.toLowerCase() == poolAddress) return poolName;
    return (
      poolMembers.find((m) => m.address.toLowerCase() == address?.toLowerCase())
        ?.wunderId || address
    );
  };

  //IMPLEMENT THIS BENEATH IN THE FUTURE

  // const resolveMember = async (address) => {
  //   if (address.toLowerCase() == poolAddress) return poolName;
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const user =
  //         (await getCachedItemDB(address.toLowerCase())) ||
  //         (await cacheItemDB(
  //           address.toLowerCase(),
  //           (
  //             await axios({
  //               method: 'POST',
  //               url: '/api/users/find',
  //               data: { address: address.toLowerCase() },
  //             })
  //           ).data,
  //           600
  //         ));
  //       resolve(user?.wunder_id || address);
  //     } catch (error) {
  //       resolve(address);
  //     }
  //   });
  // };

  const resolveProposal = (proposalId) => {
    return poolProposals.find((p) => p.id == proposalId);
  };

  const join = async (amount, secret = '') => {
    if (!version || userIsMember) return;
    return joinPool(poolAddress, userAddress, amount, secret, version?.number);
  };

  const updateUserAddress = (addr) => {
    setUserAddress(addr);
    determineIfMember(addr);
  };

  const inviteUser = (newMember) => {
    return addToWhiteList(poolAddress, userAddress, newMember, version?.number);
  };

  const createInviteLink = (secret, validFor) => {
    return addToWhiteListWithSecret(
      poolAddress,
      userAddress,
      secret,
      validFor,
      version?.number
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
      version?.number
    );
  };

  const fudSuggestion = (
    tokenAddress,
    tokenDecimals,
    title,
    description,
    value
  ) => {
    return createFudSuggestion(
      poolAddress,
      tokenAddress,
      tokenDecimals,
      title,
      description,
      value,
      userAddress,
      version?.number
    );
  };

  const swapSuggestion = (
    tokenIn,
    tokenInDecimals,
    tokenOut,
    tokenOutDecimals,
    title,
    description,
    amount
  ) => {
    return createSwapSuggestion(
      poolAddress,
      tokenIn,
      tokenInDecimals,
      tokenOut,
      tokenOutDecimals,
      title,
      description,
      amount,
      userAddress,
      version?.number
    );
  };

  const nftSellProposal = (nftAddress, tokenId, title, description, amount) => {
    return createNftSellProposal(
      poolAddress,
      nftAddress,
      tokenId,
      title,
      description,
      amount,
      userAddress,
      version?.number
    );
  };

  const nftBuyProposal = (nftAddress, tokenId, title, description, amount) => {
    return createNftBuyProposal(
      poolAddress,
      nftAddress,
      tokenId,
      title,
      description,
      amount,
      userAddress,
      version?.number
    );
  };

  const liquidateSuggestion = (title, description) => {
    return createLiquidateSuggestion(
      poolAddress,
      title,
      description,
      userAddress,
      version?.number
    );
  };

  const executable = (id) => {
    return proposalExecutable(poolAddress, id, version?.number);
  };

  const execute = (id) => {
    return new Promise(async (resolve, reject) => {
      executeProposal(poolAddress, id, version?.number)
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

  const determineIfMember = async (addr = null) => {
    const userAddr = userAddress || addr;
    if (!userAddr) return false;
    setUserIsMember(await isMember(poolAddress, userAddr));
  };

  const determineUsdcBalance = async () => {
    setUsdcBalance(await fetchPoolBalance(poolAddress));
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
    //Timeout wird gebraucht weil backend langsamer ist als frontend (events in zukunft?)
    setTimeout(async () => {
      try {
        var tokens;
        const { pool_treasury, pool_assets } = await fetchPoolData(poolAddress);
        setUsdcBalance(pool_treasury.act_balance);

        tokens = await Promise.all(
          pool_assets.map(async (asset) => {
            return await formatAsset(asset);
          })
        );
        setPoolTokens(tokens);
        determineCustomBalances(tokens);
        updateLoadingState('tokens');
        return tokens;
      } catch (error) {
        throw error;
      }
    }, 2000);
  };

  const determinePoolNfts = async () => {
    if (liquidated) return;
    try {
      setPoolNfts(await fetchPoolNfts(poolAddress, version?.number));
    } catch (error) {
      handleError('Could not load NFTs');
    }
  };

  const determinePoolBettingGames = async () => {
    try {
      const events = (
        await axios({
          url: '/api/betting/events',
        })
      ).data;
      const games = (
        await axios({
          url: '/api/betting/games',
          params: { address: poolAddress },
        })
      ).data;

      setBettingGames(
        games.map((g) => ({
          ...g,
          event: events.find((e) => e.id == g.eventId),
        }))
      );
      updateLoadingState('bets', true);
    } catch (error) {
      handleError('Could not load Games');
      updateLoadingState('bets', true);
    }
  };

  const determinePoolProposals = async (vers = null) => {
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

  const getTransactionData = async (id, transactionCount) => {
    return (
      (await getCachedItemDB(`tx_data_${poolAddress}_${id}`)) ||
      (await cacheItemDB(
        `tx_data_${poolAddress}_${id}`,
        await fetchTransactionData(
          poolAddress,
          id,
          transactionCount,
          version?.number
        )
      ))
    );
  };

  const voteWithMode = (proposalId, mode) => {
    return vote(poolAddress, proposalId, mode, userAddress, version?.number);
  };

  const voteForProposal = (proposalId) => {
    return voteFor(poolAddress, proposalId, userAddress, version?.number);
  };

  const voteAgainstProposal = (proposalId) => {
    return voteAgainst(poolAddress, proposalId, userAddress, version?.number);
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
      const vers = versionLookup[launcher.launcher_version];
      setVersion(vers);
      setClosed(closed);

      setMinInvest(shareholder_agreement?.min_invest);
      setMaxInvest(shareholder_agreement?.max_invest);
      setMaxMembers(shareholder_agreement?.max_members);
      setMinYesVoter(shareholder_agreement?.min_yes_voters);
      setVotingThreshold(shareholder_agreement?.voting_threshold);
      setVotingTime(shareholder_agreement?.voting_time);

      setPoolDescription(pool_description);
      setUsdcBalance(pool_treasury.act_balance);

      const isMem =
        pool_members.filter(
          (m) => m.members_address.toLowerCase() == userAddress?.toLowerCase()
        ).length > 0;

      setUserIsMember(isMem);

      const totalShares = pool_shares.emmited_shares;
      setPoolGovernanceToken({
        address: pool_shares?.governanc_token?.currency_contract_address,
        name: pool_shares?.governanc_token?.currency_name,
        symbol: pool_shares?.governanc_token?.currency_symbol,
        tokensForDollar: pool_shares?.tokens_for_dollar,
        totalSupply: totalShares,
      });
      updateLoadingState('init');

      const resolvedMembers = (
        await axios({
          method: 'POST',
          url: '/api/users/find',
          data: { addresses: pool_members.map((m) => m.members_address) },
        })
      ).data;

      const formattedMembers = await Promise.all(
        pool_members.map(async (mem) => {
          const member = {
            address: mem.members_address,
            tokens: mem.pool_shares_balance,
            share: (mem.pool_shares_balance * 100) / totalShares,
          };
          try {
            const user = resolvedMembers.find(
              (m) => m.wallet_address == member.address
            );

            member.wunderId = user?.wunder_id;
            member.firstName = user?.firstname;
            member.lastName = user?.lastname;
          } catch (err) {
            console.log(err);
          }
          return member;
        })
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
      await determinePoolData(poolAddress)
        .then(async ({ vers, exists, isMem }) => {
          if (exists && isMem) {
            await determinePoolNfts();
            await determinePoolBettingGames();
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
    setLoadingState((state) =>
      Object.fromEntries(Object.entries(state).map(([k]) => [k, false]))
    );
    setVersion(null);
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
    nfts: poolNfts,
    bettingGames,
    governanceToken: poolGovernanceToken,
    proposals: poolProposals,
    getTransactionData,
    determinePoolData,
    apeSuggestion,
    fudSuggestion,
    swapSuggestion,
    nftSellProposal,
    nftBuyProposal,
    liquidateSuggestion,
    vote: voteWithMode,
    voteForProposal,
    voteAgainstProposal,
    executable,
    execute,
    determineTokens: determinePoolTokens,
    determineNfts: determinePoolNfts,
    determineBettingGames: determinePoolBettingGames,
    determineProposals: determinePoolProposals,
    determineBalance: determineUsdcBalance,
  };
}
