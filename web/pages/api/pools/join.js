import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { poolAddress, userAddress, amount, secret } = req.body;
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const body = {
      joining_user_address: userAddress.toLowerCase(),
      invest: amount,
    };

    const resp = await axios({
      method: 'POST',
      url: `${
        process.env.POOLS_SERVICE
      }/web3Proxy/pools/${poolAddress.toLowerCase()}/members`,
      params: { secret: secret },
      headers: headers,
      data: body,
    });

    res.status(200).json(resp.data);
  } catch (error) {
    console.log('[ERROR] Join Pool: ', error?.response?.data?.error || error);
    res.status(500).json(error?.response?.data?.error || error);
  }
}
