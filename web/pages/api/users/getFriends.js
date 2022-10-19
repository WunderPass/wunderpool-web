import axios from 'axios';

export default async function handler(req, res) {
  try {
    const ownersWunderId = req.query.wunderId;

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
    };

    const response = await axios({
      method: 'get',
      url: `https://identity-service.wunderpass.org/v4/contacts/connected/${ownersWunderId}`,
      headers: headers,
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toJSON() });
  }
}
