import axios from 'axios';

export default async function handler(req, res) {
  try {
    const wunderId = req.query.wunderId;
    console.log(
      'URL: ',
      `${process.env.IDENTITY_SERVICE}/v3/nft/cashback/isAuthorized/${wunderId}`
    );

    const resp = await axios({
      method: 'get',
      url: encodeURI(
        `${process.env.IDENTITY_SERVICE}/v3/nft/cashback/isAuthorized/${wunderId}`
      ),
      headers: {
        Authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
      },
    });
    res.status(200).json({ resp: resp.data });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
