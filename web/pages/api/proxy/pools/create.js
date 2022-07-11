import axios from 'axios';

export default async function handler(req, res) {
  try {
    const {
      version,
      network,
      creator,
      name,
      tokenName,
      tokenSymbol,
      amount,
      members,
      minInvest,
      maxInvest,
      maxMembers,
      votingThreshold,
      votingTime,
      minYesVoters,
    } = req.body;

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
    };

    const body = {
      launcher: {
        launcher_name: 'PoolLauncher',
        launcher_version: version || 'Epsilon',
        launcher_network: network || 'POLYGON_MAINNET',
      },
      pool_name: name,
      pool_governance_token: {
        token_name: tokenName,
        token_symbol: tokenSymbol,
      },
      pool_creator: creator,
      pool_members: members.map((m) => ({ members_address: m })),
      shareholder_agreement: {
        min_invest: minInvest,
        max_invest: maxInvest,
        max_members: maxMembers,
        voting_threshold: votingThreshold,
        voting_time: votingTime,
        min_yes_voters: minYesVoters,
      },
      initial_invest: amount,
    };

    const resp = await axios({
      method: 'POST',
      url: 'https://pools-service.wunderpass.org/web3Proxy/pools',
      headers: headers,
      data: body,
    });
    console.log(`[${new Date().toJSON()}] Pool created`, {
      creator,
      name,
      amount,
      minInvest,
      maxInvest,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    res.status(500).json(error);
  }
}
