const axios = require('axios');

export default async function handler(req, res) {
  try {
    const data = {
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      handle: req.body.handle,
      email: req.body.email,
      phone_number: req.body.phoneNumber,
    };

    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
    };

    const resp = await axios({
      method: 'post',
      url: 'https://identity-service.wunderpass.org/v4/create/wunder_identity',
      data: data,
      headers: headers,
    });
    res.status(200).json({ authToken: 1 });
  } catch (error) {
    res.status(500).json({ error: error?.response?.data?.error || error });
  }
}
