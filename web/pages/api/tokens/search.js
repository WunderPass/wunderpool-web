import axios from 'axios';

export default async function handler(req, res) {
  const tokens = await axios({
    url: `${process.env.TOKEN_API}/polygon/tokens/search/${req.query.param}`,
  });
  res.status(200).json(tokens.data);
}
