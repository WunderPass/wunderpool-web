import axios from 'axios';

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_CLIENT_TOKEN}`,
    };

    const { data } = await axios({
      method: 'post',
      url: `${process.env.BETTING_SERVICE}/competitions/${req.body.competitionId}/games/bets`,
      headers,
      data: {
        user_address: req.body.userAddress,
        bets: req.body.bets,
        signature: req.body.signature,
      },
    });

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
