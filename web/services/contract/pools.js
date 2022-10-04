import { ethers } from 'ethers';
import { initPool, versionLookup } from './init';
import { usdc } from '/services/formatter';
import {
  addToWhiteListDelta,
  fundPoolDelta,
  joinPoolDelta,
} from './delta/pools';
import { fundPoolGamma, joinPoolGamma } from './gamma/pools';
import {
  addToWhiteListWithSecretEpsilon,
  fetchWhitelistedUserPoolsEpsilon,
} from './epsilon/pools';
import axios from 'axios';
import { httpProvider } from './provider';
import { approve } from './token';
import { cacheItemDB, getCachedItemDB } from '../caching';
import {
  addToWhiteListWithSecretZeta,
  fetchWhitelistedUserPoolsZeta,
} from './zeta/pools';

export function createPool(
  creator,
  poolName,
  poolDescription,
  tokenName,
  tokenSymbol,
  minInvest,
  maxInvest,
  amount,
  members,
  maxMembers,
  votingThreshold,
  votingTime,
  minYesVoters,
  image
) {
  return new Promise(async (resolve, reject) => {
    const body = {
      launcher: {
        launcher_name: 'PoolLauncher',
        launcher_version: 'Zeta',
        launcher_network: 'POLYGON_MAINNET',
      },
      pool_name: poolName,
      pool_description: poolDescription,
      pool_governance_token: {
        token_name: tokenName,
        token_symbol: tokenSymbol,
      },
      pool_creator: creator.toLowerCase(),
      pool_members: members.map((m) => ({ members_address: m.toLowerCase() })),
      shareholder_agreement: {
        min_invest: minInvest,
        max_invest: maxInvest,
        max_members: maxMembers,
        voting_threshold: votingThreshold,
        voting_time: votingTime,
        min_yes_voters: minYesVoters,
      },
      initial_invest: amount,
    };

    const formData = new FormData();
    formData.append('pool_image', image);
    formData.append('pool', JSON.stringify(body));
    approve(creator, '0xB5Ae136D3817d8116Fce70Ac47e856fc484dafAe', usdc(amount))
      .then(() => {
        axios({
          method: 'POST',
          url: '/api/pools/create',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        })
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        console.log(err);
        reject('USD Transaction failed');
      });
  });
}

export function getPoolAddressFromTx(txHash, version = null) {
  const iface = new ethers.utils.Interface([
    'event PoolLaunched(address indexed poolAddress, string name, address governanceTokenAddress)',
  ]);
  return new Promise((resolve, reject) => {
    httpProvider
      .getTransactionReceipt(txHash)
      .then((receipt) => {
        const events = receipt.logs.map((log) => {
          try {
            return iface.decodeEventLog('PoolLaunched', log.data, log.topics);
          } catch {
            return null;
          }
        });
        const event = events.filter((e) => e)[0];
        const { name, poolAddress } = event;
        resolve({ name: name, address: poolAddress });
      })
      .catch((err) => {
        console.log(err);
        reject(false);
      });
  });
}

export async function formatAsset(asset) {
  const address = asset.asset_infos.currency_contract_address;
  const token =
    (await getCachedItemDB(address)) ||
    (await cacheItemDB(
      address,
      (
        await axios({
          url: `/api/tokens/show`,
          params: { address: address },
        })
      ).data,
      600
    ));
  let {
    name,
    symbol,
    decimals,
    price = 0,
    image_url,
    dollar_price = 0,
    tradable = false,
  } = token;

  name = name || asset.asset_name;
  symbol = symbol || asset.asset_infos.currency_symbol;
  decimals = decimals || asset.asset_infos.decimals;

  return {
    name,
    symbol,
    address,
    decimals,
    balance: asset.pool_balance,
    usdValue: asset.pool_balance * dollar_price,
    image: image_url,
    price: price,
    dollarPrice: dollar_price,
    verified: Boolean(dollar_price),
    tradable,
  };
}

async function formatMembers(members, totalSupply) {
  const resolvedMembers = (
    await axios({
      url: '/api/users/find',
      params: { addresses: members.map((m) => m.members_address) },
    })
  ).data;

  return await Promise.all(
    members.map(async (mem) => {
      const member = {
        address: mem.members_address,
        tokens: mem.pool_shares_balance,
        shares: mem.pool_shares_balance,
        share: (mem.pool_shares_balance * 100) / totalSupply,
      };
      const user = resolvedMembers.find(
        (m) => m.wallet_address == member.address
      );

      member.wunderId = user?.wunder_id;
      member.firstName = user?.firstname;
      member.lastName = user?.lastname;
      return member;
    })
  );
}

function formatGovernanceToken(token) {
  return {
    name: token.governanc_token.currency_name,
    address: token.governanc_token.currency_contract_address,
    symbol: token.governanc_token.currency_symbol,
    price: 1 / token.tokens_for_dollar,
    totalSupply: token.emmited_shares,
  };
}

function formatShareholderAgreement(shareholderAgreement) {
  const minInvest = shareholderAgreement.min_invest;
  const maxInvest = shareholderAgreement.max_invest;
  const maxMembers = shareholderAgreement.max_members;
  const votingThreshold = shareholderAgreement.voting_threshold;
  const votingTime = shareholderAgreement.voting_time;
  const minYesVoters = shareholderAgreement.min_yes_voters;

  return {
    minInvest,
    maxInvest,
    maxMembers,
    votingThreshold,
    votingTime,
    minYesVoters,
  };
}

export async function formatPool(pool, user = null) {
  try {
    const tokens = await Promise.all(
      pool.pool_assets
        ? pool.pool_assets.map(async (asset) => await formatAsset(asset))
        : []
    );
    const usdBalance = pool.pool_treasury.act_balance;
    const version = versionLookup[pool.launcher.launcher_version];
    const cashInTokens = tokens
      .map((tkn) => tkn.usdValue)
      .reduce((a, b) => a + b, 0);
    const totalBalance = cashInTokens + usdBalance;

    const governanceToken = formatGovernanceToken(pool.pool_shares);

    const members = await formatMembers(
      pool.pool_members,
      governanceToken.totalSupply
    );

    const userShare = user
      ? members.find((member) => member.address.toLowerCase() == user)?.share
      : 0;
    const userBalance = (totalBalance * userShare) / 100;

    const shareholderAgreement =
      version.number > 4
        ? formatShareholderAgreement(pool.shareholder_agreement)
        : null;

    return {
      active: pool.active,
      closed: pool.closed,
      address: pool.pool_address,
      name: pool.pool_name,
      version,
      minInvest: pool.min_stake,
      usdBalance,
      cashInTokens,
      totalBalance,
      userShare,
      userBalance,
      tokens,
      members,
      governanceToken,
      shareholderAgreement,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function fetchUserPools(userAddress) {
  return new Promise(async (resolve, reject) => {
    axios({ url: `/api/pools/userPools?address=${userAddress}` })
      .then(async (res) => {
        const pools = await Promise.all(
          // .filter((pool) => pool.active) => As of 29.07.2022 All Pools are {active: false} :(
          res.data
            .filter((pool) => pool.active)
            .map(
              async (pool) => await formatPool(pool, userAddress.toLowerCase())
            )
        );
        resolve(pools.filter((p) => p));
      })
      .catch((err) => console.log(err));
  });
}

export function fetchWhitelistedUserPools(userAddress) {
  return new Promise(async (resolve, reject) => {
    const epsilonPools = await fetchWhitelistedUserPoolsEpsilon(userAddress);
    const zetaPools = await fetchWhitelistedUserPoolsZeta(userAddress);
    resolve([...epsilonPools, ...zetaPools]);
  });
  // return new Promise(async (resolve, reject) => {
  //   axios({ url: `/api/pools/whitelisted?address=${userAddress}` })
  //     .then(async (res) => {
  //       const pools = await Promise.all(
  //         res.data
  //           .filter((pool) => pool.active)
  //           .map(async (pool) => await formatPool(pool))
  //       );
  //       resolve(pools.filter((p) => p));
  //     })
  //     .catch((err) => reject(err));
  // });
}

export function fetchAllPools() {
  return new Promise(async (resolve, reject) => {
    axios({ url: '/api/pools/all' })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function joinPool(poolAddress, userAddress, value, secret, version) {
  if (version > 3) {
    return joinPoolDelta(poolAddress, userAddress, value, secret);
  } else {
    return joinPoolGamma(poolAddress, value);
  }
}

export function fetchPoolName(poolAddress, version = null) {
  return new Promise(async (resolve, reject) => {
    const [wunderPool] = initPool(poolAddress);
    wunderPool
      .name()
      .then((res) => resolve(res))
      .catch((err) => reject('Pool Not Found'));
  });
}

export function isMember(poolAddress, userAddress, version = null) {
  return new Promise(async (resolve, reject) => {
    axios({ url: `/api/pools/show?address=${poolAddress}` })
      .then(async (res) => {
        var isMember = false;
        res.data.pool_members.forEach((element) => {
          if (element.members_address == userAddress) isMember = true;
        });
        resolve(isMember);
      })
      .catch((err) => reject(err));
  });
}

export function fetchPoolBalance(poolAddress, version = null) {
  return new Promise(async (resolve, reject) => {
    axios({ url: `/api/pools/show?address=${poolAddress}` })
      .then(async (res) => {
        resolve(res.data.pool_treasury.act_balance);
      })
      .catch((err) => reject(err));
  });
}

export function addToWhiteList(poolAddress, userAddress, newMember, version) {
  if (version > 3) {
    return addToWhiteListDelta(poolAddress, userAddress, newMember);
  } else {
    throw 'Not implemented before DELTA';
  }
}

export function addToWhiteListWithSecret(
  poolAddress,
  userAddress,
  secret,
  validFor,
  version
) {
  if (version > 5) {
    return addToWhiteListWithSecretZeta(
      poolAddress,
      userAddress,
      secret,
      validFor
    );
  } else if (version > 4) {
    return addToWhiteListWithSecretEpsilon(
      poolAddress,
      userAddress,
      secret,
      validFor
    );
  } else {
    throw 'Not implemented before EPSILON';
  }
}

export function fundPool(poolAddress, amount, version) {
  if (version > 3) {
    return fundPoolDelta(poolAddress, amount);
  } else {
    return fundPoolGamma(poolAddress, amount);
  }
}

export function fetchPoolData(poolAddress) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(
        (await axios({ url: `/api/pools/show?address=${poolAddress}` })).data
      );
    } catch (error) {
      reject(error);
    }
  });
}
