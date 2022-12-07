const axios = require('axios');

const ERRORS = [
  {
    name: 'UnsupportedNicknameFormatException',
    message: 'Username Invalid',
  },
  { name: 'HandleAlreadyExistsException', message: 'Username already taken' },
];

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

    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };

    const resp = await axios({
      method: 'put',
      url: `${process.env.IDENTITY_SERVICE}/v4/wunderPasses/${data.wunderId}`,
      data: data,
      headers: headers,
    });
    res.status(200).json(resp.data);
  } catch (err) {
    let errorMessage = err?.response?.data?.error;
    let errorClass = err?.response?.data?.errorClass || '';

    ERRORS.forEach((errorObj) => {
      if (errorClass.match(errorObj.name)) {
        errorMessage = errorObj.message;
      }
    });
    console.log(
      'USER UPDATE ERROR',
      err?.response?.data || err?.response || err
    );
    res
      .status(err?.response?.data?.status || 500)
      .json(errorMessage || 'Request Invalid');
  }
}
