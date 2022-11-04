import axios from 'axios';
const FormData = require('form-data');
const fs = require('fs');

export default async function handler(req, res) {
  try {
    const {
      name,
      version,
      network,
      creator,
      events,
      invitations,
      payoutRule,
      stake,
      decimals,
      tokenAddress,
      isPublic,
    } = req.body;

    const data = new FormData();

    data.append(
      'competition',
      JSON.stringify({
        name,
        version,
        network,
        creator,
        events,
        invitations,
        rule: {
          payout_type: payoutRule,
          stake,
          // stake_decimals: decimals,
          // stake_currency_address: tokenAddress,
        },
        public: isPublic,
      }),
      { contentType: 'application/json' }
    );

    data.append('image', fs.createReadStream('./public/casama_logo.png'), {
      filename: 'CasamaIcon.png',
      contentType: 'image/png',
    });

    data.append('banner', fs.createReadStream('./public/casama-blk.png'), {
      filename: 'CasamaLogo.png',
      contentType: 'image/png',
    });

    const headers = {
      authorization: `Bearer 5nCea5SrMrlxqP5rlG63`,
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
