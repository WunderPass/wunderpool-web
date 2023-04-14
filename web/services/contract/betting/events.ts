import { SupportedChain } from './../types';
import axios from 'axios';

export async function registerEvent(eventId: number, chain: SupportedChain) {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/betting/events/register',
      data: { eventId, chain },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.response.data);
      throw error.response.data;
    }
    console.log(error);
    throw error;
  }
}

export async function resolveEvent(
  eventId: number,
  homeScore: number,
  awayScore: number
) {
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
