import axios from 'axios';

export default async function handler(req, res) {
  try {
    const wunderId = req.query.wunderId;
    const { data } = await axios({
      method: 'get',
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v4/rewards/pendingRewards/${wunderId}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
      },
    });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
