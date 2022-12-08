import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { wunderId } = req.query;

    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };

    const resp = await axios({
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/wunderPasses/${wunderId}`
      ),
      headers: headers,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    res.status(500).json(error);
  }
}
