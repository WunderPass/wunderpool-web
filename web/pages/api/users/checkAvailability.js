import axios from 'axios';

export default async function handler(req, res) {
  try {
    const wunderId = req.query.wunderId;
    let available = false;
    let reason = null;

    const isResponse = await axios({
      url: encodeURI(`${process.env.IDENTITY_SERVICE}/v4/exists/${wunderId}`),
      headers: {
        authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
      },
    });

    if (isResponse.data) {
      reason = 'This username is already taken';
    } else {
      available = true;
    }
    res.status(200).json({ available: available, reason: reason });
  } catch (error) {
    res.status(500).json(error);
  }
}
