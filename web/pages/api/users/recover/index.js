import axios from 'axios';
import { decrypt } from '/services/crypto';
const fs = require('fs');

export default async function handler(req, res) {
  try {
    const userIdentifier = req.query.identifier;
    const password = req.body.password;

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };

    const response = await axios({
      url: `${process.env.IDENTITY_SERVICE}/v4/wunderPasses/recovery/${userIdentifier}`,
      headers: headers,
    });

    const decryptedSeed = decrypt(
      response.data.encrypted_seed_phrase,
      password
    );

    let blackList = {};
    if (fs.existsSync('./data/blackList.json')) {
      blackList = JSON.parse(fs.readFileSync('./data/blackList.json', 'utf8'));
    }

    let ip;
    if (req.headers['x-forwarded-for']) {
      ip = req.headers['x-forwarded-for'].split(',')[0];
    } else if (req.headers['x-real-ip']) {
      ip = req.connection.remoteAddress;
    } else {
      ip = req.connection.remoteAddress;
    }

    blackList[ip] ??= 3;
    blackList[userIdentifier] ??= 5;

    let status;
    let message;

    if (blackList[userIdentifier] == 0) {
      status = 401;
      message = { error: 'Account Locked. Verification Required' };
    } else if (blackList[ip] == 0) {
      status = 429;
      message = { error: 'Account Locked' };
    } else if (decryptedSeed) {
      blackList[userIdentifier] = 5;
      blackList[ip] = 3;
      status = 200;
      message = { encryptedSeedPhrase: response.data.encrypted_seed_phrase };
    } else {
      blackList[userIdentifier] -= 1;
      blackList[ip] -= 1;
      status = 403;
      message = {
        error: `Wrong Password. Remaining tries: ${Math.min(
          blackList[userIdentifier],
          blackList[ip]
        )}`,
      };
    }

    fs.writeFileSync('./data/blackList.json', JSON.stringify(blackList));
    res.status(status).json(message);

    return;
  } catch (error) {
    if (/CredentialsNotStoredExceptio/.test(error.response?.data?.errorClass)) {
      res.status(412).json({ error: 'Unknown Credentials' });
    } else if (
      /UnknownWunderIdException/.test(error.response?.data?.errorClass)
    ) {
      res.status(404).json({ error: 'Unknown Identifier' });
      return;
    } else {
      res
        .status(error.response?.status || 500)
        .json({ error: error.response?.data?.error || error });
      return;
    }
  }
}
