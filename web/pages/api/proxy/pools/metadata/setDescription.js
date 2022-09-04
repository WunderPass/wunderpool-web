import axios from 'axios';

export default async function handler(req, res) {
  try {
    const poolAddress = req.query.poolAddress;
    const description = req.body;

    const headers = {
      'Content-Type': 'text/plain',
      Authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const resp = await axios({
      method: 'POST',
      url: `${process.env.POOLS_SERVICE}/web3Proxy/pools/${poolAddress}/description`,
      headers: headers,
      data: description,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    res.status(500).json(error);
  }
}
