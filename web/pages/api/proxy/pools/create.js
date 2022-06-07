import axios from 'axios';

export default async function handler(req, res) {
  try {
    const {
      version,
      network,
      creator,
      name,
      minInvest,
      tokenName,
      tokenSymbol,
      price,
    } = req.body;

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const body = {
      launcher: {
        launcher_name: 'PoolLauncher',
        launcher_version: version || 'Delta',
        launcher_network: network || 'POLYGON_MAINNET',
      },
      pool_creator: creator,
      pool_name: name,
      min_invest: minInvest,
      pool_token_name: tokenName,
      pool_token_symbol: tokenSymbol,
      token_price: price,
    };

    const resp = await axios({
      method: 'POST',
      url: 'https://pools-service.wunderpass.org/web3Proxy/pools/createPool',
      headers: headers,
      data: body,
    });
    console.log(`[${new Date().toJSON()}] Pool created`, {
      name,
      creator,
      version,
      minInvest,
      tokenName,
      tokenSymbol,
      price,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    res.status(500).json(error);
  }
}
