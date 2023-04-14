import axios from 'axios';
import { ethers } from 'ethers';
import { toEthString } from '/services/formatter';
import { initPoolGamma } from '/services/contract/gamma/init';
import { usdcBalanceOf } from '/services/contract/token';
import { tokenAbi } from '/services/contract/init';
import { httpProvider } from '/services/contract/provider';
const fs = require('fs');

const tokenMap = {};
const userMap = {};

const headers = {
  'Content-Type': 'application/json',
  authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
};

async function getToken(address) {
  if (!tokenMap[address]) {
    const token = (
      await axios({
        url: `${process.env.TOKEN_API}/polygon/tokens/${address}`,
      })
    ).data;
    const tokenContract = new ethers.Contract(
      address,
      tokenAbi,
      httpProvider()
    );
    const decimals =
      token?.decimals || (await tokenContract.decimals().toNumber());
    tokenMap[address] = { price: token?.dollar_price || 0, decimals };
  }
  return tokenMap[address];
}

async function formatMember(member) {
  const address = member.members_address;

  if (userMap[address]) {
    return {
      address,
      shares: member.pool_shares_balance,
      wunderId: userMap[address],
    };
  }
  const { data } = await axios({
    method: 'post',
    url: encodeURI(
      `${process.env.IDENTITY_SERVICE}/v4/contacts/filter/by_network/POLYGON`
    ),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    },
    data: [address.toLowerCase()],
  });
  const wunderId = data[0].wunder_id;
  userMap[address] = wunderId;
  return {
    address,
    shares: member.pool_shares_balance,
    wunderId,
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

    const activePools = (
      await axios({
        method: 'get',
        url: `${process.env.POOLS_SERVICE}/web3Proxy/pools?active=true`,
        headers,
      })
    ).data;

    const liquidatedPools = (
      await axios({
        method: 'get',
        url: `${process.env.POOLS_SERVICE}/web3Proxy/pools?active=false`,
        headers,
      })
    ).data;

    const poolResult = [...activePools, ...liquidatedPools];

    const pools = await Promise.all(
      poolResult.map(async (pool) => {
        let usdBalance = 0;
        let tokenBalance = 0;
        let totalBalance = 0;
        if (pool.active && pool.pool_members?.length > 0) {
          try {
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
          } catch (error) {}
        }
        return {
          ...pool,
          usdBalance,
          tokenBalance,
          totalBalance,
        };
      })
    );

    const poolData = ['Zeta', 'Epsilon'].map((version) => {
      const versionFilter = (p) => p.launcher.launcher_version == version;
      const versionPools = pools.filter(versionFilter);
      const versionPoolsActive = activePools.filter(versionFilter);

      const tvl = versionPools
        .map((p) => p.totalBalance)
        .reduce((a, b) => a + b, 0);
      return {
        version: version,
        poolsCreated: versionPools.length,
        activePools: versionPoolsActive.length,
        tvl,
        averagePoolValue: tvl / (versionPoolsActive.length || 1),
      };
    });

    const totalValueLocked = poolData
      .map((d) => d.tvl)
      .reduce((a, b) => a + b, 0);

    const topFive = await Promise.all(
      pools
        .sort((a, b) => b.totalBalance - a.totalBalance)
        .slice(0, 5)
        .map(async (pool) => ({
          version: pool.launcher.launcher_version,
          name: pool.pool_name,
          members: await Promise.all(
            pool.pool_members.map(async (member) => await formatMember(member))
          ),
          usdBalance: pool.usdBalance,
          tokenBalance: pool.tokenBalance,
          totalBalance: pool.totalBalance,
        }))
    );

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
