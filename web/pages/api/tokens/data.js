import axios from 'axios';

export default async function handler(req, res) {
  const token = await axios({
    url: `${process.env.TOKEN_API}/polygon/tokens/${req.query.address}`,
  });
  res.status(200).json(token.data);
}
