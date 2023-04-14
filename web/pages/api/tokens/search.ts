import { TokensShowResponse } from './show';
import axios from 'axios';

export type TokensSearchResponse = TokensShowResponse[];

export default async function handler(req, res) {
  const { chain } = req.query;
  if (!chain) return res.status(400).json('Invalid Request: Missing Chain');
  try {
    const { data } = await axios({
      url: `${process.env.TOKEN_API}/${chain}/tokens/search/${req.query.param}`,
    });
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
}
