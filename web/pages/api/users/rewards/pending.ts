import axios from 'axios';

export type UserRewardsResponse = {
  wunder_id: string;
  reward_type: string;
  description: string;
  reward_amount: number;
}[];

export default async function handler(req, res) {
  try {
    const wunderId = req.query.wunderId;
    const { data } = await axios({
      method: 'get',
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/rewards/pendingRewards/${wunderId}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
      },
    });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
