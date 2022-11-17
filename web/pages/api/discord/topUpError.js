import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { transactionId, error, wunderId, address } = req.body;
    await axios({
      method: 'post',
      url: 'https://app.wunderpass.org/discord_bot/errors/topUp',
      data: {
        transactionId,
        error,
        wunderId,
        address,
      },
    });
    res.status(200).send('OK');
  } catch (error) {
    console.log(error);
    res.status(500).send('ERROR');
  }
}
