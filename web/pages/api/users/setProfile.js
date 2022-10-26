const axios = require('axios');

export default async function handler(req, res) {
  try {
    const data = {
      wunderId: req.body.wunderId,
      handle: req.body.handle,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phone_number: req.body.phone_number,
    };
    console.log('data in setProfile', data);

    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
    };

    const resp = await axios({
      method: 'put',
      url: `https://identity-service.wunderpass.org/v4/wunderPasses/${data.wunderId}`,
      data: data,
      headers: headers,
    });
    res.status(200).json(resp.data);
    console.log(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
