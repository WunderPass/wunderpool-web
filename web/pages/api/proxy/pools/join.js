import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { poolAddress, userAddress, amount } = req.body;
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const body = {
      pool_address: poolAddress?.toLowerCase(),
      joining_user_address: userAddress,
      invest: amount,
    };

    const resp = await axios({
      method: 'POST',
      url: 'https://pools-service.wunderpass.org/web3Proxy/pools/byPoolAddress/joinPool',
      headers: headers,
      data: body,
    });
    console.log(`[${new Date().toJSON()}] Pool joined`, {
      poolAddress,
      userAddress,
      amount,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
