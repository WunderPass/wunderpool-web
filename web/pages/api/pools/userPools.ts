import { ShowPoolResponse } from './show';
import axios from 'axios';
import { translateChain } from '../../../services/backendApi';

export type UserPoolsResponse = ShowPoolResponse[];

export default async function handler(req, res) {
  const { chain } = req.query;
  if (!chain) return res.status(400).json('Invalid Request: Missing Chain');
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const resp = await axios({
      method: 'get',
      url: `${process.env.POOLS_SERVICE}/web3Proxy/pools`,
      params: {
        userAddress: req.query.address?.toLowerCase(),
        active: true,
        network: translateChain(chain),
      },
      headers: headers,
    });

    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
