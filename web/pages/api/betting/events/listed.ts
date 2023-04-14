import axios from 'axios';
import { formatEvent } from '../../../../services/bettingHelpers';

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_ADMIN_TOKEN}`,
    };
    const { data } = await axios({
      url: `${process.env.BETTING_SERVICE}/admin/listedEvents`,
      headers,
    });

    res.status(200).json(data.map(formatEvent));
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
