import axios from 'axios';

export default async function handler(req, res) {
  try {
    const liquidity = await axios({
      url: `${process.env.TOKEN_API}/web3/liquidity/token/polygon/${req.query.address}`,
    });

    res.status(200).json(liquidity.data);
  } catch (err) {
    console.log(err);
  }
}
