import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { data } = await axios({
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/rewards/admin/loadPending`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_ADMIN_TOKEN}`,
      },
    });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
