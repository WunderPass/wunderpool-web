import axios from 'axios';

export default async function handler(req, res) {
  try {
    const price = await axios({
      url: `${process.env.TOKEN_API}/web3/price/polygon/${req.query.address}`,
      params: { usdAmount: Number(req.query.amount || 1).toFixed(0) },
    });
    res.status(200).json(price.data.bestPrice);
  } catch (err) {
    console.log(err);
  }
}
