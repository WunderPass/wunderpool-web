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
      url: `https://pools-service.wunderpass.org/web3Proxy/pools/${poolAddress}/description`,
      headers: headers,
      data: description,
    });
    res.status(200).json(resp.data);
    console.log('success', resp.data);
  } catch (error) {
    console.log('error', error);
    res.status(500).json(error);
  }
}
