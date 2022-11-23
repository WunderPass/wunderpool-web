import { sendTransferReceiverMail } from '../../../services/mailer/transfer';

const fs = require('fs');

export default async function handler(req, res) {
  try {
    const { to, firstName, sender, amount, txHash } = req.body;

    if (to && firstName && sender && amount && txHash) {
      let notified = [];
      if (fs.existsSync('./data/notifiedTransfers.json')) {
        notified = JSON.parse(
          fs.readFileSync('./data/notifiedTransfers.json', 'utf8')
        );
      }

      if (notified.includes(req.body.txHash)) {
        res.status(200).send('Notified Users');
        return;
      }
      await sendTransferReceiverMail({ to, firstName, sender, amount, txHash });
      notified.push(req.body.txHash);
      fs.writeFileSync(
        './data/notifiedTransfers.json',
        JSON.stringify(notified)
      );
      res.status(200).send('Notified Users');
    } else {
      res.status(401).send('Invalid Request');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}
