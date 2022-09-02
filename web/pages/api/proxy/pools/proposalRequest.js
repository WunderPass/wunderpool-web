import axios from 'axios';

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const {
      address,
      action,
      title,
      description,
      userAddress,
      balance,
      tokenIn,
      tokenInDecimals,
      tokenOut,
      tokenOutDecimals,
    } = req.query;

    const resp = await axios({
      method: 'post',
      url: `${
        process.env.POOLS_SERVICE
      }/web3Proxy/pools/${address?.toLowerCase()}/proposals/request`,
      headers: headers,
      params: {
        action: action,
      },
      data: {
        title: title,
        description: description,
        proposal_action: action,
        pool_address: address?.toLowerCase(),
        user_address: userAddress?.toLowerCase(),
        asset_in: {
          balance: balance,
          asset_infos: {
            currency_contract_address: tokenIn?.toLowerCase(),
            decimals: tokenInDecimals,
          },
        },
        token_out: {
          currency_contract_address: tokenOut?.toLowerCase(),
          decimals: tokenOutDecimals,
        },
      },
    });
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
