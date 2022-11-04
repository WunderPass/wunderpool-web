import axios from 'axios';
import { formatEvent } from '/services/eventHelpers';

export default async function handler(req, res) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.BETTING_SERVICE_TOKEN}`,
    };
    const { data: liveEvents } = await axios({
      url: `${process.env.BETTING_SERVICE}/admin/liveEvents`,
      headers,
    });
    const { data: registeredEvents } = await axios({
      url: `${process.env.BETTING_SERVICE}/admin/settledEvents`,
      headers,
    });
    registeredEvents.sort(function (a, b) {
      return a.utc_start_time < b.utc_start_time
        ? -1
        : a.utc_start_time > b.utc_start_time
        ? 1
        : 0;
    });

    liveEvents.sort(function (a, b) {
      return a.utc_start_time < b.utc_start_time
        ? -1
        : a.utc_start_time > b.utc_start_time
        ? 1
        : 0;
    });
    res.status(200).json([...liveEvents, ...registeredEvents].map(formatEvent));
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
