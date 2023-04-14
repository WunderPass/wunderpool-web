import axios from 'axios';
import { translateChain } from '../../../../services/backendApi';
import { formatEvent } from '../../../../services/bettingHelpers';

export default async function handler(req, res) {
  try {
    const { eventId, chain } = req.body;

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_ADMIN_TOKEN}`,
    };

    const { data } = await axios({
      method: 'post',
      url: `${process.env.BETTING_SERVICE}/admin/settleEvent/${eventId}`,
      params: { network: translateChain(chain) },
      headers,
    });
    res.status(200).json(formatEvent(data));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res
        .status(error.response.status)
        .json(error.response.data?.error || error.response.data);
    }
    console.log(error);
    return res.status(500).json(error);
  }
}
