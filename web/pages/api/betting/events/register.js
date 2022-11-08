import axios from 'axios';
import { formatEvent } from '/services/bettingHelpers';

export default async function handler(req, res) {
  try {
    const eventId = req.body.eventId;

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_ADMIN_TOKEN}`,
    };

    const { data } = await axios({
      method: 'post',
      url: `${process.env.BETTING_SERVICE}/admin/settleEvent/${eventId}`,
      headers,
    });
    res.status(200).json(formatEvent(data));
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
