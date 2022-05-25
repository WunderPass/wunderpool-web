import axios from 'axios';

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const resp = await axios({
      method: 'get',
      url: 'https://pools-service.wunderpass.org/web3Proxy/pools/web2/all',
      headers: headers,
    });
    console.log(resp);
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}