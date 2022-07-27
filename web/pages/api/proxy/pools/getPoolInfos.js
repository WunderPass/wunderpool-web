import axios from 'axios';

export default async function handler(req, res) {
  try {
    const poolAddress = req.query.poolAddress;

    const resp = await axios({
      method: 'GET',
      url: encodeURI(
        `https://pools-service.wunderpass.org/web3Proxy/pools/${poolAddress}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
      },
    });
    res.status(200).json({ resp: resp.data });
  } catch (error) {
    res.status(500).json(error);
  }
}
