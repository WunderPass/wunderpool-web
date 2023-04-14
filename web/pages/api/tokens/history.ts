import axios from 'axios';

export type TokensHistoryResponse = {
  price: number;
  timestamp: string;
}[];

export default async function handler(req, res) {
  const { chain } = req.query;
  if (!chain) return res.status(400).json('Invalid Request: Missing Chain');
  try {
    const { data } = await axios({
      url: `${process.env.TOKEN_API}/${chain}/tokens/history/${req.query.address}?time=${req.query.time}`,
    });
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
}
