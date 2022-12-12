import axios from 'axios';

export default async function handler(req, res) {
  try {
    const userIdentifier = req.query.identifier;

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };

    const response = await axios({
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/wunderPasses/recovery/${userIdentifier}`
      ),
      headers: headers,
    });

    res.status(200).json({ confirmed: response.data.confirmed_backup });
  } catch (error) {
    res.status(200).json({ confirmed: false });
  }
}
