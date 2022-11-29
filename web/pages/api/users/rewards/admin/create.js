import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { data } = await axios({
      method: 'POST',
      url: encodeURI(`${process.env.IDENTITY_SERVICE}/rewards/admin`),
      data: {
        wunder_id: req.body.wunderId,
        reward_type: req.body.rewardType,
        description: req.body.description,
        reward_amount: req.body.rewardAmount,
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.IS_SERVICE_ADMIN_TOKEN}`,
      },
    });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
