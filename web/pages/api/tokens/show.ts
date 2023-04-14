import axios from 'axios';

export type TokensShowResponse = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  chain: string;
  tradable: boolean;
  price: number;
  liquidity: number;
  image_url: string;
  dollar_price: number;
  market_cap: number;
};

export default async function handler(req, res) {
  const { chain, address } = req.query;
  if (!chain || !address)
    return res.status(401).json('Invalid Request: Missing Chain or Address');
  try {
    const { data } = await axios({
      url: `${process.env.TOKEN_API}/${chain}/tokens/${address}`,
    });
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
}
