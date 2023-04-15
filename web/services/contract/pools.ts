import { UsersFindResponse } from './../../pages/api/users/find';
import { TokensShowResponse } from './../../pages/api/tokens/show';
import { SupportedChain, VersionInfo } from './types';
import { AllPoolsResponse } from './../../pages/api/pools/all';
import { PoolsWhitelistsResponse } from './../../pages/api/pools/whitelisted';
import { UserPoolsResponse } from './../../pages/api/pools/userPools';
import { ShowPoolResponse } from './../../pages/api/pools/show';
import { usdc } from '../../services/formatter';
import { launcherAddress, versionLookup } from './init';
import { addToWhiteListDelta, joinPoolDelta } from './delta/pools';
import { joinPoolGamma } from './gamma/pools';
import { addToWhiteListWithSecretEpsilon } from './epsilon/pools';
import axios from 'axios';
import { approveUSDC } from './token';
import { cacheItemDB, getCachedItemDB } from '../caching';
import { compAddr } from '../memberHelpers';

export function createPool({
  creator,
  poolName,
  poolDescription = '',
  tokenName,
  tokenSymbol,
  minInvest,
  maxInvest,
  amount,
  members,
  maxMembers = 50,
  votingThreshold = 50,
  votingTime,
  minYesVoters,
  isPublic = false,
  autoLiquidateTs = 0,
  image,
  chain,
}) {
  return new Promise(async (resolve, reject) => {
    const body = {
      pool_type: autoLiquidateTs > 0 ? 'TEMPORARY' : 'LONG_LASTING',
      launcher: {
        launcher_name: 'PoolLauncher',
        launcher_version: 'Eta',
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
        min_invest: minInvest || amount,
        max_invest: maxInvest || amount,
        max_members: maxMembers,
        voting_threshold: votingThreshold,
        voting_time: votingTime,
        min_yes_voters: minYesVoters,
      },
      initial_invest: amount,
      public: isPublic,
      lifetime_end:
        autoLiquidateTs > 0 ? new Date(autoLiquidateTs).toISOString() : null,
    };

    const formData = new FormData();
    formData.append('pool_image', image);
    formData.append('pool', JSON.stringify(body));
    approveUSDC(creator, launcherAddress('ETA', chain), usdc(amount), chain)
      .then(() => {
        axios({
          method: 'POST',
          url: '/api/pools/create',
          data: formData,
          params: {
            pool_type: autoLiquidateTs > 0 ? 'TEMPORARY' : 'LONG_LASTING',
          },
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

export type FormattedAsset = {
  name: string;
  symbol: string;
  address: string;
  decimals?: number;
  balance?: number;
  usdValue?: number;
  image?: string;
  price?: number;
  dollarPrice?: number;
  verified?: boolean;
  tradable?: boolean;
};

export async function formatAsset(
  asset: ShowPoolResponse['pool_assets'][number],
  speedy = false
): Promise<FormattedAsset> {
  const address = asset.asset_infos.currency_contract_address;
  if (speedy) {
    return {
      name: asset.asset_infos.currency_name,
      symbol: asset.asset_infos.currency_symbol,
      address,
    };
  }
  const token: TokensShowResponse =
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
    balance: asset.balance,
    usdValue: asset.balance * dollar_price,
    image: image_url,
    price: price,
    dollarPrice: dollar_price,
    verified: Boolean(dollar_price),
    tradable,
  };
}

export type FormattedPoolMember = {
  address: string;
  tokens: number;
  shares: number;
  share: number;
  wunderId?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
};

export async function formatMembers(
  members: ShowPoolResponse['pool_members'],
  totalSupply: number,
  speedy = false
): Promise<FormattedPoolMember[]> {
  if (speedy) {
    return members.map((mem) => ({
      address: mem.members_address,
      tokens: mem.pool_shares_balance,
      shares: mem.pool_shares_balance,
      share: (mem.pool_shares_balance * 100) / totalSupply,
    }));
  }
  const resolvedMembers: UsersFindResponse<string[]> = (
    await axios({
      method: 'POST',
      url: '/api/users/find',
      data: { addresses: members.map((m) => m.members_address) },
    })
  ).data;

  return await Promise.all(
    members.map(async (mem) => {
      const member = {
        address: mem.members_address,
        tokens: mem.pool_shares_balance,
        shares: mem.pool_shares_balance,
        share: (mem.pool_shares_balance * 100) / totalSupply,
        wunderId: undefined,
        userName: undefined,
        firstName: undefined,
        lastName: undefined,
      };
      const user = resolvedMembers.find(
        (m) => m.wallet_address == member.address
      );

      member.wunderId = user?.wunder_id;
      member.userName = user?.handle;
      member.firstName = user?.firstname;
      member.lastName = user?.lastname;
      return member;
    })
  );
}

export type FormattedGovernanceToken = {
  name: string;
  address: string;
  symbol: string;
  price: number;
  totalSupply: number;
  decimals: number;
};

export function formatGovernanceToken(
  token: ShowPoolResponse['pool_shares']
): FormattedGovernanceToken {
  return {
    name: token.governanc_token.currency_name,
    address: token.governanc_token.currency_contract_address,
    symbol: token.governanc_token.currency_symbol,
    price: 1 / token.tokens_for_dollar,
    totalSupply: token.emmited_shares,
    decimals: token.governanc_token.decimals,
  };
}

export type FormattedShareholderAgreement = {
  minInvest: number;
  maxInvest: number;
  maxMembers: number;
  votingThreshold: number;
  votingTime: number;
  minYesVoters: number;
};

export function formatShareholderAgreement(
  shareholderAgreement: ShowPoolResponse['shareholder_agreement']
): FormattedShareholderAgreement {
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

export type FormattedPool = {
  active: boolean;
  closed: boolean;
  address: string;
  name: string;
  version: VersionInfo;
  usdBalance: number;
  cashInTokens: number;
  totalBalance: number;
  userShare: number;
  userBalance: number;
  tokens: FormattedAsset[];
  members: FormattedPoolMember[];
  governanceToken: FormattedGovernanceToken;
  shareholderAgreement: FormattedShareholderAgreement;
};

export async function formatPool(
  pool: ShowPoolResponse,
  user = null,
  speedy = false
): Promise<FormattedPool> {
  try {
    const tokens = await Promise.all(
      pool.pool_assets
        ? pool.pool_assets.map(
            async (asset) => await formatAsset(asset, speedy)
          )
        : []
    );
    const usdBalance = pool.pool_treasury.act_balance;
    const version =
      versionLookup[pool.launcher.launcher_version?.toLowerCase()];
    const cashInTokens = tokens
      .map((tkn) => tkn.usdValue)
      .reduce((a, b) => a + b, 0);
    const totalBalance = cashInTokens + usdBalance;

    const governanceToken = formatGovernanceToken(pool.pool_shares);

    const members = await formatMembers(
      pool.pool_members,
      governanceToken.totalSupply,
      speedy
    );

    const userShare = user
      ? members.find((member) => compAddr(member.address, user))?.share
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

export async function fetchUserPools(
  userAddress: string,
  chain: SupportedChain,
  speedy = false
) {
  try {
    const { data }: { data: UserPoolsResponse } = await axios({
      url: '/api/pools/userPools',
      params: { address: userAddress, chain: chain },
    });
    const pools = await Promise.all(
      data
        .filter((pool) => pool.active)
        .map(
          async (pool) =>
            await formatPool(pool, userAddress.toLowerCase(), speedy)
        )
    );
    return pools.filter((p) => p);
  } catch (error) {
    console.log(error);
    return [];
  }
}

export type WhitelistedPool = {
  address: string;
  name: string;
};

export async function fetchWhitelistedUserPools(
  userAddress: string
): Promise<WhitelistedPool[]> {
  try {
    const { data }: { data: PoolsWhitelistsResponse } = await axios({
      url: `/api/pools/whitelisted?address=${userAddress}`,
    });
    return data.map((pool) => ({
      address: pool.pool_address,
      name: pool.pool_name,
    }));
  } catch (error) {
    console.log(error);
  }
}

export async function fetchAllPools() {
  try {
    const { data }: { data: AllPoolsResponse } = await axios({
      url: '/api/pools/all',
    });
    return data;
  } catch (error) {
    throw error;
  }
}

export function joinPool(
  poolAddress: string,
  userAddress: string,
  value,
  secret: string,
  version: number,
  chain: SupportedChain
) {
  if (version > 3) {
    return joinPoolDelta(poolAddress, userAddress, value, secret, chain);
  } else {
    return joinPoolGamma(poolAddress, value);
  }
}

export async function isMember(poolAddress: string, userAddress: string) {
  try {
    const poolData = await fetchPoolData(poolAddress);
    return Boolean(
      poolData.pool_members.find((element) =>
        compAddr(element.members_address, userAddress)
      )
    );
  } catch (error) {
    throw error;
  }
}

export async function fetchPoolBalance(poolAddress: string) {
  try {
    const poolData = await fetchPoolData(poolAddress);
    return poolData.pool_treasury.act_balance;
  } catch (error) {
    throw error;
  }
}

export function addToWhiteList(
  poolAddress: string,
  userAddress: string,
  newMember: string,
  version: number
) {
  if (version > 3) {
    return addToWhiteListDelta(poolAddress, userAddress, newMember);
  } else {
    throw 'Not implemented before DELTA';
  }
}

export function addToWhiteListWithSecret(
  poolAddress: string,
  userAddress: string,
  secret: string,
  validFor: number,
  version: number,
  afterSignature: (secret: string) => void = () => {}
) {
  if (version > 4) {
    return addToWhiteListWithSecretEpsilon(
      poolAddress,
      userAddress,
      secret,
      validFor,
      afterSignature
    );
  } else {
    throw 'Not implemented before EPSILON';
  }
}

export async function fetchPoolData(
  poolAddress: string
): Promise<ShowPoolResponse> {
  try {
    return (await axios({ url: `/api/pools/show?address=${poolAddress}` }))
      .data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response.data;
    } else {
      throw error;
    }
  }
}
