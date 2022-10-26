import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { wunderId } = req.body;

    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
    };

    const resp = await axios({
      method: 'get',
      url: `https://identity-service.wunderpass.org/v4/wunderPasses/${wunderId}`,
      headers: headers,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    res.status(500).json(error);
  }
}
