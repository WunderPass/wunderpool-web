import axios from 'axios';

export async function registerEvent(eventId) {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/betting/events/register',
      data: { eventId },
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function resolveEvent(eventId, homeScore, awayScore) {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/betting/events/resolve',
      data: { eventId, homeScore, awayScore },
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
