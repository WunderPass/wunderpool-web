import { sendSignUpMail } from '/services/mailer/signUp';

const axios = require('axios');
const FormData = require('form-data');

const ERRORS = [
  {
    name: 'UnsupportedNicknameFormatException',
    message: 'Username not Available',
  },
  { name: 'HandleGenerationException', message: 'Username already taken' },
];

export default async function handler(req, res) {
  try {
    const data = new FormData();

    data.append(
      'user',
      JSON.stringify({
        firstname: req.body.firstName || undefined,
        lastname: req.body.lastName || undefined,
        handle: req.body.handle || undefined,
        email: req.body.email || undefined,
        phone_number: req.body.phoneNumber,
        encrypted_seed_phrase: req.body.seedPhrase,
      }),
      { contentType: 'application/json' }
    );

    const headers = {
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
      ...data.getHeaders(),
    };

    const resp = await axios({
      method: 'post',
      url: `${process.env.IDENTITY_SERVICE}/v4/wunderPasses`,
      data: data,
      headers: headers,
    });
    try {
      axios({
        method: 'post',
        url: 'https://app.wunderpass.org/discord_bot/signup',
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          handle: req.body.handle,
          service: 'Casama',
        },
      });
    } catch (discordError) {
      console.log(discordError);
    }
    try {
      sendSignUpMail({
        to: req.body.email,
        firstName: req.body.firstName || req.body.handle,
      });
    } catch (mailError) {
      console.log(mailError);
    }
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
      'USER CREATE ERROR',
      err?.response?.data || err?.response || err
    );
    res
      .status(err?.response?.data?.status || 500)
      .json(errorMessage || 'Request Invalid');
  }
}
