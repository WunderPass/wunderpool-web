import axios from 'axios';
import { usdcBalanceOf } from '/services/contract/token';
const fs = require('fs');

const tokenMap = {};
const userMap = {};

function formatMember(member) {
  const address = member.members_address;

  if (userMap[address]) {
    return {
      user: address,
      shares: member.pool_shares_balance,
      wunderId: userMap[address],
    };
  }
  const users = JSON.parse(fs.readFileSync('./data/userMapping.json', 'utf8'));
  const wunderId =
    users.filter((u) => u.address.toLowerCase() == address.toLowerCase())[0]
      ?.wunderId || 'Unknown User';
  userMap[address] = wunderId;
  return {
    address: address,
    shares: member.pool_shares_balance,
    wunderId: wunderId,
  };
}

async function getBalance(asset) {
  const address = asset.asset_infos.currency_contract_address;
  if (tokenMap[address]) {
    return tokenMap[address] * asset.pool_balance;
  } else {
    const token = (
      await axios({
        url: `https://token-api.wunderpass.org/polygon/tokens/${address}`,
      })
    ).data;
    tokenMap[address] = token.dollar_price;
    return token.dollar_price * asset.pool_balance;
  }
}

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const poolResult = (
      await axios({
        method: 'get',
        url: 'https://pools-service.wunderpass.org/web3Proxy/pools/web2/all',
        headers: headers,
      })
    ).data;

    const pools = await Promise.all(
      poolResult.map(async (pool) => {
        let usdBalance = 0;
        let tokenBalance = 0;
        let totalBalance = 0;
        if (pool.active && pool.pool_members?.length > 0) {
          usdBalance = Number(await usdcBalanceOf(pool.pool_address));
          const tokenBalances = await Promise.all(
            pool.pool_assets.map(async (asset) => await getBalance(asset))
          );
          tokenBalance = tokenBalances.reduce((a, b) => a + b, 0);
          totalBalance = Number(usdBalance) + Number(tokenBalance);
        }
        return { ...pool, usdBalance, tokenBalance, totalBalance };
      })
    );

    const activePools = pools.filter(
      (p) => p.active && p.pool_members?.length > 0
    );

    const poolData = ['Gamma', 'Delta', 'Epsilon'].map((version) => {
      const versionPools = pools.filter(
        (p) => p.launcher.launcher_version == version
      );
      return {
        version: version,
        poolsCreated: versionPools.length,
        activePools: activePools.filter(
          (p) => p.launcher.launcher_version == version
        ).length,
        tvl: versionPools.map((p) => p.totalBalance).reduce((a, b) => a + b, 0),
      };
    });

    const totalValueLocked = poolData
      .map((d) => d.tvl)
      .reduce((a, b) => a + b, 0);

    const topFive = pools
      .sort((a, b) => b.totalBalance - a.totalBalance)
      .slice(0, 5)
      .map((pool) => ({
        version: pool.launcher.launcher_version,
        name: pool.pool_name,
        members: pool.pool_members.map((member) => formatMember(member)),
        usdBalance: pool.usdBalance,
        tokenBalance: pool.tokenBalance,
        totalBalance: pool.totalBalance,
      }));

    res.status(200).json({ totalValueLocked, poolData, topFive });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
