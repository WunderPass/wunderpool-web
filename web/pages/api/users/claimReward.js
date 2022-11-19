import axios from 'axios';

export default async function handler(req, res) {
  try {
    const type = req.query.type;
    console.log(req.headers);
    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
    };

    const { data } = await axios({
      method: 'post',
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/rewards/claim/${type}`
      ),
      headers,
    });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
