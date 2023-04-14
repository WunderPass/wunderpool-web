import axios from 'axios';

export type ShowPoolResponse = {
  pool_type: 'TEMPORARY' | 'LONG_LASTING';
  launcher: {
    launcher_name: string;
    launcher_version: string;
    launcher_network: string;
  };
  pool_address: string;
  pool_name: string;
  pool_description: string;
  pool_governance_token: {
    address: string;
    token_name: string;
    token_symbol: string;
    decimals: number;
  };
  pool_creator: string;
  pool_members: {
    members_address: string;
    pool_shares_balance: number;
    invest: number;
  }[];
  pool_invites: string[];
  shareholder_agreement: {
    min_invest: number;
    max_invest: number;
    max_members: number;
    voting_threshold: number;
    voting_time: number;
    min_yes_voters: number;
  };
  initial_invest: number;
  active: boolean;
  closed: boolean;
  public: boolean;
  pool_treasury: {
    currency: {
      currency_contract_address: string;
      currency_name: string;
      currency_symbol: string;
      decimals: number;
    };
    act_balance: number;
  };
  pool_shares: {
    governanc_token: {
      currency_contract_address: string;
      currency_name: string;
      currency_symbol: string;
      decimals: number;
    };
    emmited_shares: number;
    tokens_for_dollar: number;
  };
  pool_assets: {
    asset_name: string;
    asset_infos: {
      currency_contract_address: string;
      currency_name: string;
      currency_symbol: string;
      decimals: number;
    };
    balance: number;
  }[];
  lifetime_end: string;
};

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
      }/web3Proxy/pools/${req.query.address?.toLowerCase()}`,
      headers: headers,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
