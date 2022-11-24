import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { currency, amount, callbackUrl, wunderId } = req.body;

    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
    };

    const data = {
      currency: currency,
      amount: amount,
      callbackUrl: callbackUrl,
    };

    let url = 'https://identity-service.wunderpass.org/pay_with_paypal';

    if (wunderId) {
      url += `/${wunderId}`;
    } else {
      headers['signed_message'] = req.headers.signed;
      headers['signature'] = req.headers.signature;
    }

    const response = await axios({
      method: 'post',
      url: encodeURI(url),
      data: data,
      headers: headers,
    });
    res.status(200).json({ ...response.data });
  } catch (error) {
    console.log('PAYPAL INIT ERROR', error);
    res.status(500).json({ error: error.toJSON() });
  }
}
