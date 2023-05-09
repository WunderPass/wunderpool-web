import axios from 'axios';
import { translateChain } from '../../../services/backendApi';

const ERRORS = [
  { name: 'PaymentDoesntExistException', message: 'Invalid Transaction ID' },
  { name: 'IllegalPaymentStateException', message: 'TopUp already succeeded' },
  { name: 'GasWarException', message: 'Gas Price is too high' },
];

export default async function handler(req, res) {
  try {
    const { transactionId, chain } = req.body;

    const headers = {
      'Content-Type': 'application/json',
      signed_message: req.headers.signed,
      signature: req.headers.signature,
      authorization: `Bearer ${process.env.IS_SERVICE_CLIENT_TOKEN}`,
    };

    const data = {
      payment_transaction_id: transactionId,
      network: translateChain(chain),
    };

    try {
      const response = await axios({
        method: 'post',
        url: 'https://identity-service.wunderpass.org/topup/requestUsd',
        data: data,
        headers: headers,
      });
      return res.status(200).json(response.data);
    } catch (error) {
      console.log(error);
      let errorMessage = null;
      let rawMessage = error?.response?.data?.error;

      ERRORS.forEach((errorObj) => {
        if (rawMessage.match(errorObj.name)) {
          errorMessage = errorObj.message;
        }
      });
      return res
        .status(error?.response?.data?.status || 500)
        .json({ error: errorMessage || 'Request Invalid' });
    }
  } catch (error) {
    console.log('TOPUP ERROR', error);
    return res.status(500).json({ error: error });
  }
}
