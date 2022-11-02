import axios from 'axios';

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const resp = await axios({
      url: `${
        process.env.POOLS_SERVICE
      }/web3Proxy/pools/${req.query.poolAddress.toLowerCase()}/members/shares/distribute`,
      headers: headers,
    });

    res.status(200).json(resp.data.pool_members);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
