import axios from 'axios';
import { usdcAddress } from '/services/contract/init';
const FormData = require('form-data');

export default async function handler(req, res) {
  try {
    const {
      name,
      version,
      eventIds,
      invitations,
      payoutRule,
      stake,
      isPublic,
      maxMembers = 50,
    } = req.body;

    const data = new FormData();

    data.append(
      'competition',
      JSON.stringify({
        name,
        version,
        network: 'POLYGON_MAINNET',
        events: eventIds,
        invitations,
        rule: {
          payout_type: payoutRule,
          stake,
          stake_decimals: 6,
          stake_currency: 'USDC',
          stake_currency_address: usdcAddress,
          max_members: (Number(maxMembers) || 50) + 1,
        },
        public: isPublic,
      }),
      { contentType: 'application/json' }
    );

    const headers = {
      authorization: `Bearer ${process.env.BETTING_SERVICE_CLIENT_TOKEN}`,
      ...data.getHeaders(),
    };

    const resp = await axios({
      method: 'post',
      url: `${process.env.BETTING_SERVICE}/competitions/freerolls`,
      data,
      headers,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
