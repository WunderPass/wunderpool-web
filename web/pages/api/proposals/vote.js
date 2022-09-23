import axios from 'axios';

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const { address, id, userAddress, vote, signature } = req.body;

    const body = {
      pool_address: address?.toLowerCase(),
      proposal_id: id,
      user_address: userAddress?.toLowerCase(),
      vote, // YES || NO
      signature,
    };

    const resp = await axios({
      method: 'post',
      url: `${
        process.env.POOLS_SERVICE
      }/web3Proxy/pools/${address?.toLowerCase()}/proposals/${id}/votings`,
      headers: headers,
      data: body,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
