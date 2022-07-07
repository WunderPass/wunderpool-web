import axios from 'axios';

export default async function handler(req, res) {
  try {
    const wunderId = req.query.wunderId;

    const resp = await axios({
      method: 'get',
      url: encodeURI(
        `https://identity-service.wunderpass.org/v3/nft/cashback/isAuthorized/${wunderId}`
      ),
      headers: {
        authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
      },
    });
    res.status(200).json({ resp: resp.data });
  } catch (error) {
    res.status(500).json(error);
  }
}
