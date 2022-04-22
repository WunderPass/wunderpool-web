import axios from "axios";

export default async function handler(req, res) {
  const token = await axios({
    url: `https://token-api.wunderpass.org/polygon/tokens/price/${req.query.address}`,
  });
  res.status(200).json(token.data);
}
