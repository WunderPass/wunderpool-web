import axios from 'axios';

export default async function handler(req, res) {
  try {
    const type = req.query.type;
    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };

    const { data } = await axios({
      method: 'post',
      url: encodeURI(`${process.env.IDENTITY_SERVICE}/rewards/claim/${type}`),
      headers,
    });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
