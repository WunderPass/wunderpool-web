import axios from 'axios';
import { translateChain } from '../../../../services/backendApi';
import { usdcAddress } from '../../../../services/contract/init';
const FormData = require('form-data');

export default async function handler(req, res) {
  try {
    const {
      name,
      version,
      creator,
      eventIds,
      invitations,
      payoutRule,
      stake,
      isPublic,
      chain,
    } = req.body;

    const data = new FormData();

    data.append(
      'competition',
      JSON.stringify({
        name,
        version,
        network: translateChain(chain),
        creator,
        events: eventIds,
        invitations,
        rule: {
          payout_type: payoutRule,
          stake,
          stake_decimals: 6,
          stake_currency: 'USDC',
          stake_currency_address: usdcAddress(chain),
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
      url: `${process.env.BETTING_SERVICE}/competitions`,
      data,
      headers,
    });
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
