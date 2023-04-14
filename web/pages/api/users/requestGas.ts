import axios from 'axios';

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };

    const { data } = await axios({
      method: 'post',
      url: 'https://identity-service.wunderpass.org/v4/requestGasFunds',
      headers: headers,
    });
    res.status(200).json({ resp: data });
  } catch (error) {
    res.status(204).json({ error: 'User has enough MATIC' });
  }
}
