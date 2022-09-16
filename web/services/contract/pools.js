import { ethers } from 'ethers';
import { initPool, versionLookup } from './init';
import { usdc } from '/services/formatter';
import {
  addToWhiteListDelta,
  fetchWhitelistedUserPoolsDelta,
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
import { approve, usdcBalanceOf } from './token';
import { cacheItemDB, getCachedItemDB } from '../caching';

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
        launcher_version: 'Epsilon',
        launcher_network: 'POLYGON_MAINNET',
      },
      pool_name: poolName,
      pool_description: poolDescription,
      pool_governance_token: {
        token_name: tokenName,
        token_symbol: tokenSymbol,
      },
      pool_creator: creator,
      pool_members: members.map((m) => ({ members_address: m })),
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
    approve(creator, '0x4294FB86A22c3A89B2FA660de39e23eA91D5B35E', usdc(amount))
      .then(() => {
        axios({
          method: 'POST',
          url: '/api/proxy/pools/create',
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

async function formatMember(member, totalSupply) {
  let user;
  try {
    user =
      (await getCachedItemDB(member.members_address)) ||
      (await cacheItemDB(
        member.members_address,
        (
          await axios({
            url: '/api/proxy/users/find',
            params: { address: member.members_address },
          })
        ).data,
        600
      ));
  } catch (e) {}
  return {
    address: member.members_address,
    shares: member.pool_shares_balance,
    share: (member.pool_shares_balance * 100) / totalSupply,
    wunderId: user?.wunder_id,
    firstName: user?.firstname,
    lastName: user?.lastname,
  };
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
async function formatShareholderAgreement(shareholderAgreement) {
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

    const members = await Promise.all(
      pool.pool_members.map(
        async (member) =>
          await formatMember(member, governanceToken.totalSupply)
      )
    );
    const userShare = user
      ? members.find((member) => member.address.toLowerCase() == user)?.share
      : 0;
    const userBalance = (totalBalance * userShare) / 100;

    const shareholderAgreement =
      version.number > 4
        ? await formatShareholderAgreement(pool.shareholder_agreement)
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
    axios({ url: `/api/proxy/pools/userPools?address=${userAddress}` })
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
    const deltaPools = await fetchWhitelistedUserPoolsDelta(userAddress);
    const epsilonPools = await fetchWhitelistedUserPoolsEpsilon(userAddress);
    resolve([...deltaPools, ...epsilonPools]);
  });
  // return new Promise(async (resolve, reject) => {
  //   axios({ url: `/api/proxy/pools/whitelisted?address=${userAddress}` })
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
    axios({ url: '/api/proxy/pools/all' })
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
    axios({ url: `/api/proxy/pools/show?address=${poolAddress}` })
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
    axios({ url: `/api/proxy/pools/show?address=${poolAddress}` })
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
  if (version > 4) {
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
        (await axios({ url: `/api/proxy/pools/show?address=${poolAddress}` }))
          .data
      );
    } catch (error) {
      reject(error);
    }
  });
}
