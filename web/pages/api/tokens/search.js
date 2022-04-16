import axios from "axios";

export default async function handler(req, res) {
  const tokens = await axios({
    url: `https://token-api.wunderpass.org/polygon/tokens/search/${req.query.param}`,
  });
  res.status(200).json(tokens.data);
}
