import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { competitionId, userAddress } = req.body;

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_CLIENT_TOKEN}`,
    };

    const resp = await axios({
      method: 'post',
      url: `${process.env.BETTING_SERVICE}/competitions/freerolls/${competitionId}/members`,
      data: userAddress,
      headers,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error?.response?.data?.error);
    res.status(500).json(error?.response?.data?.error || error);
  }
}
