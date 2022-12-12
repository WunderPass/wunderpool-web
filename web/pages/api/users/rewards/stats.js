import axios from 'axios';

export default async function handler(req, res) {
  try {
    const wunderId = req.query.wunderId;

    const headers = {
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };

    const response = await axios({
      url: `${process.env.IDENTITY_SERVICE}/promoters/${wunderId}/stats`,
      headers: headers,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.log('error', error);
    res.status(500).json(error);
  }
}
