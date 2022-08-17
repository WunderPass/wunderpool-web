import axios from 'axios';

export default async function handler(req, res) {
  try {
    const token = await axios({
      url: `${process.env.TOKEN_API}/polygon/tokens/history/${req.query.address}?time=${req.query.time}`,
    });
    res.status(200).json(token.data);
  } catch (err) {
    console.log(err);
  }
}
