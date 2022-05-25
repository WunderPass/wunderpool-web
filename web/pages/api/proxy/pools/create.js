import axios from 'axios';

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const body = {
      launcher: {
        launcher_name: 'PoolLauncher',
        launcher_version: req.body.version || 'Delta',
        launcher_network: req.body.network || 'POLYGON_MAINNET',
      },
      pool_creator: req.body.creator,
      pool_name: req.body.name,
      min_invest: req.body.minInvest,
      pool_token_name: req.body.tokenName,
      pool_token_symbol: req.body.tokenSymbol,
      token_price: req.body.price,
    };

    const resp = await axios({
      method: 'POST',
      url: 'https://pools-service.wunderpass.org/web3Proxy/pools/createPool',
      headers: headers,
      data: body,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    res.status(500).json(error);
  }
}
