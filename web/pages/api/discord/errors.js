import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { error, wunderId, userName } = req.body;

    await axios({
      method: 'post',
      url: 'https://app.wunderpass.org/discord_bot/errors/casama',
      data: {
        error: error,
        wunderId: wunderId,
        userName: userName,
      },
    });
    res.status(200).send('OK');
  } catch (error) {
    console.log(error);
    res.status(500).send('ERROR');
  }
}
