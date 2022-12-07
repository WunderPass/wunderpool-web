import axios from 'axios';
import { sendVerificationMail } from '../../../../services/mailer/verification';
const fs = require('fs');

export default async function handler(req, res) {
  try {
    const { wunderId } = req.query;

    let notified = [];
    if (fs.existsSync('./data/verificationMailsSent.json')) {
      notified = JSON.parse(
        fs.readFileSync('./data/verificationMailsSent.json', 'utf8')
      );
    }

    if (notified.includes(wunderId)) {
      res.status(401).send('Email has already been sent');
      return;
    }
    notified.push(wunderId);
    fs.writeFileSync(
      './data/verificationMailsSent.json',
      JSON.stringify(notified)
    );

    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };

    const { data: profile } = await axios({
      url: `${process.env.IDENTITY_SERVICE}/v4/wunderPasses/${wunderId}`,
      headers: headers,
    });

    const verified = profile?.contactDetails?.email_verified;
    const email = profile?.contactDetails?.email;
    const firstName = profile?.firstname || profile?.handle;
    const code = profile?.contactDetails?.email_verification_code;

    if (verified) {
      res.status(401).json('Email already verified');
      return;
    } else if (email && code) {
      sendVerificationMail({ to: email, firstName, code });
      res.status(200).json('Email sent');
      return;
    } else {
      res.status(401).json('Email required');
      return;
    }
  } catch (error) {
    res.status(500).json(error);
  }
}
