import axios from 'axios';

const ERRORS = [
  { name: 'PaymentDoesntExistException', message: 'Invalid Transaction ID' },
  { name: 'IllegalPaymentStateException', message: 'TopUp already succeeded' },
  { name: 'GasWarException', message: 'Gas Price is too high' },
];

export default async function handler(req, res) {
  try {
    const { transactionId } = req.body;

    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_TOKEN}`,
    };

    const data = {
      payment_transaction_id: transactionId,
    };

    axios({
      method: 'post',
      url: 'https://identity-service.wunderpass.org/requestUsd',
      data: data,
      headers: headers,
    })
      .then((response) => {
        res.status(200).json(response.data);
        return;
      })
      .catch((err) => {
        console.log(err);
        let errorMessage = null;
        let rawMessage = err?.response?.data?.error;

        ERRORS.forEach((errorObj) => {
          if (rawMessage.match(errorObj.name)) {
            errorMessage = errorObj.message;
          }
        });
        res
          .status(err?.response?.data?.status || 500)
          .json({ error: errorMessage || 'Request Invalid' });
        return;
      });
  } catch (error) {
    console.log('TOPUP ERROR', error);
    res.status(500).json({ error: error });
  }
}
