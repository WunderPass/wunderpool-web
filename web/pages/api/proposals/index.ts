import axios from 'axios';

export type ProposalsResponse = {
  title: string;
  description: string;
  proposal_action: 'LIQUIDATE_POOL' | 'SWAP_TOKEN' | 'CUSTOM';
  pool_address: string;
  user_address: string;
  proposal_id: number;
  created_at: string;
  deadline: string;
  state: 'OPEN' | 'EXECUTED' | 'DECLINED' | 'ABORTED';
  total_shares: number;
  votings: {
    user_address: string;
    shares: number;
    vote: 'YES' | 'NO';
  }[];
}[];

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const resp = await axios({
      method: 'get',
      url: `${
        process.env.POOLS_SERVICE
      }/web3Proxy/pools/${req.query.address?.toLowerCase()}/proposals`,
      headers: headers,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
