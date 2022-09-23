import axios from 'axios';

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const { address } = req.query;

    const resp = await axios({
      method: 'post',
      url: `${
        process.env.POOLS_SERVICE
      }/web3Proxy/pools/${address?.toLowerCase()}/proposals`,
      headers: headers,
      data: req.body,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
