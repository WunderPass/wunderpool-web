import { FormattedEvent } from './../../../../services/bettingHelpers';
import axios from 'axios';
import { formatEvent } from '../../../../services/bettingHelpers';

export type BettingEventsRegisteredResponse = FormattedEvent[];

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_ADMIN_TOKEN}`,
    };
    const { data } = await axios({
      url: `${process.env.BETTING_SERVICE}/admin/settledEvents`,
      headers,
    });
    res
      .status(200)
      .json(
        data
          .sort(
            (a, b) =>
              Number(new Date(a.utc_start_time)) -
              Number(new Date(b.utc_start_time))
          )
          .map(formatEvent)
      );
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
