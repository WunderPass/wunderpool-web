import axios from 'axios';

export default async function handler(req, res) {
  try {
    const userIdentifier = req.query.identifier;

    const data = {
      encrypted_seed_phrase: req.body.seedPhrase,
      confirmed_backup: true,
    };

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };

    const response = await axios({
      method: 'post',
      url: `${process.env.IDENTITY_SERVICE}/v4/wunderPasses/recovery/${userIdentifier}`,
      headers: headers,
      data: data,
    });

    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data?.error || error.toJSON() });
  }
}
