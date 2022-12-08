import axios from 'axios';

const ERRORS = [
  {
    name: 'InsufficientAuthenticationException',
    message: 'Invalid Signature',
  },
  {
    name: 'InvalidDataAccessApiUsageException',
    message: 'Invalid WunderID',
  },
  {
    name: 'InvalidEmailVerificationCodeException',
    message: 'Invalid Verification Code',
  },
  { name: 'EmailAlreadyVerifiedException', message: 'Email already verified' },
];

export default async function handler(req, res) {
  try {
    const { wunderId, code } = req.body;

    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };
    await axios({
      method: 'post',
      url: `${process.env.IDENTITY_SERVICE}/v4/wunderPasses/verify`,
      headers: headers,
      data: { wunder_id: wunderId, email_verification_code: code },
    });
    res.status(200).send('OK');
  } catch (err) {
    let errorMessage = err?.response?.data?.error;
    let errorClass = err?.response?.data?.errorClass || '';

    ERRORS.forEach((errorObj) => {
      if (errorClass.match(errorObj.name)) {
        errorMessage = errorObj.message;
      }
    });
    console.log(
      'VERIFY MAIL ERROR',
      err?.response?.data || err?.response || err
    );
    res
      .status(err?.response?.data?.status || 500)
      .json(errorMessage || 'Request Invalid');
  }
}
