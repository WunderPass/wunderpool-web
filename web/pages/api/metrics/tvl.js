import axios from 'axios';
import { ethers } from 'ethers';
import { toEthString } from '/services/formatter';
import { initPoolGamma } from '/services/contract/gamma/init';
import { usdcBalanceOf } from '/services/contract/token';
import { tokenAbi } from '/services/contract/init';
import { fetchPoolName } from '/services/contract/pools';
import { httpProvider } from '/services/contract/provider';
const fs = require('fs');

const tokenMap = {};
const userMap = {};

async function getToken(address) {
  if (!tokenMap[address]) {
    const token = (
      await axios({
        url: `https://token-api.wunderpass.org/polygon/tokens/${address}`,
      })
    ).data;
    const tokenContract = new ethers.Contract(address, tokenAbi, httpProvider);
    const decimals =
      token?.decimals || (await tokenContract.decimals().toNumber());
    tokenMap[address] = { price: token?.dollar_price || 0, decimals };
  }
  return tokenMap[address];
}

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

async function determineTokens(poolAddress) {
  try {
    const [wunderPool, provider] = initPoolGamma(poolAddress);
    const tokenAddresses = (await wunderPool.getOwnedTokenAddresses()).filter(
      (addr) =>
        addr.toLowerCase() != '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
    );

    const tokens = await Promise.all(
      tokenAddresses.map(async (tokenAddress) => {
        const token = new ethers.Contract(tokenAddress, tokenAbi, provider);
        const balance = await token.balanceOf(poolAddress);
        const { decimals } = await getToken(tokenAddress);
        const formattedBalance = Number(toEthString(balance, decimals));

        return {
          address: tokenAddress,
          balance: formattedBalance,
        };
      })
    );
    return tokens;
  } catch (error) {
    // console.log('ERROR Fetching Tokens', error);
    return [];
  }
}

async function getBalance(address, balance) {
  if (balance == 0) return 0;
  const { price } = await getToken(address);
  return price * balance;
}

export default async function handler(req, res) {
  try {
    if (!fs.existsSync('./data/metrics')) {
      fs.mkdirSync('./data/metrics');
    }
    const timeStamp = `${new Date().getUTCFullYear()}-${String(
      new Date().getUTCMonth() + 1
    ).padStart(2, '0')}-${new Date().getDate()}`;
    if (
      fs.existsSync(`./data/metrics/${timeStamp}.json`) &&
      req.query.refresh != 'true'
    ) {
      const json = fs.readFileSync(`./data/metrics/${timeStamp}.json`, 'utf8');
      res.status(200).json(json);
      return;
    }

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

    const liquidatedPools = fs.existsSync('./data/liquidatedPools.json')
      ? JSON.parse(fs.readFileSync('./data/liquidatedPools.json', 'utf8'))
      : [];

    const pools = await Promise.all(
      poolResult.map(async (pool) => {
        let usdBalance = 0;
        let tokenBalance = 0;
        let totalBalance = 0;
        // BROKEN As of 30.07.2022 => All Pools are active: false
        // if (pool.active && pool.pool_members?.length > 0) {
        if (!liquidatedPools.includes(pool.pool_address)) {
          try {
            const exists = await fetchPoolName(pool.pool_address);
            pool.active = true;
            usdBalance = Number(await usdcBalanceOf(pool.pool_address));
            // const poolTokens =
            //   pool.pool_assets.length > 0
            //     ? pool.pool_assets.map((asset) => ({
            //         address: asset.asset_infos.currency_contract_address,
            //         balance: asset.pool_balance,
            //       }))
            //     : await determineTokens(pool.pool_address);
            const poolTokens = await determineTokens(pool.pool_address);
            const tokenBalances = await Promise.all(
              poolTokens.map(
                async ({ address, balance }) =>
                  await getBalance(address, balance)
              )
            );
            tokenBalance = tokenBalances.reduce((a, b) => a + b, 0);
            totalBalance = Number(usdBalance) + Number(tokenBalance);
          } catch (error) {
            liquidatedPools.push(pool.pool_address);
          }
        }
        return {
          ...pool,
          usdBalance,
          tokenBalance,
          totalBalance,
        };
      })
    );

    fs.writeFileSync(
      './data/liquidatedPools.json',
      JSON.stringify(liquidatedPools)
    );

    const activePools = pools.filter((p) => p.active && p.totalBalance > 0);

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

    const result = {
      timestamp: new Date().toISOString(),
      totalValueLocked,
      poolsCreated: pools.length,
      activePools: activePools.length,
      poolData,
      topFive,
    };
    fs.writeFileSync(
      `./data/metrics/${timeStamp}.json`,
      JSON.stringify(result)
    );

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
