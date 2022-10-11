import axios from 'axios';

export async function makePublic(
  poolName,
  usdcBalance,
  inviteLink,
  poolAddress
) {
  try {
    const data = {
      poolName,
      usdcBalance,
      inviteLink,
      poolAddress,
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
