import axios from 'axios';

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const { address, id } = req.query;

    const resp = await axios({
      method: 'get',
      url: `${
        process.env.POOLS_SERVICE
      }/web3Proxy/pools/${address?.toLowerCase()}/proposals/${id}`,
      headers: headers,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
