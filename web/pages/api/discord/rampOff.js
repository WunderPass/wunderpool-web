import axios from 'axios';

export default async function handler(req, res) {
  try {
    const {
      userName,
      address,
      amount,
      payoutMethod,
      payoutIdentifier,
      txHash,
    } = req.body;
    await axios({
      method: 'post',
      url: 'https://app.wunderpass.org/discord_bot/rampOff',
      data: {
        userName,
        address,
        amount,
        payoutMethod,
        payoutIdentifier,
        txHash,
      },
    });
    res.status(200).send('OK');
  } catch (error) {
    console.log(error);
    res.status(500).send('ERROR');
  }
}
