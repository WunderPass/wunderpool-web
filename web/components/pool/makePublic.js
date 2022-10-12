import axios from 'axios';

export async function makePublic(poolAddress, inviteLink) {
  try {
    const data = {
      poolAddress,
      inviteLink,
    };

    const res = await axios({
      method: 'POST',
      url: '/api/pools/public/create',
      data,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
