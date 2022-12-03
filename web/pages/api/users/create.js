import { sendSignUpMail } from '/services/mailer/signUp';

const axios = require('axios');
const FormData = require('form-data');

export default async function handler(req, res) {
  try {
    const data = new FormData();

    data.append(
      'user',
      JSON.stringify({
        firstname: req.body.firstName ? req.body.firstName : req.body.handle,
        lastname: req.body.lastName == '' ? req.body.handle : req.body.lastName,
        handle: req.body.handle,
        email: req.body.email == '' ? null : req.body.email,
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
      sendSignUpMail({ to: req.body.email, firstName: req.body.firstName });
    } catch (mailError) {
      console.log(mailError);
    }
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error?.response?.data?.error || error });
  }
}
