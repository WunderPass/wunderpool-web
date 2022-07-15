import axios from 'axios';
import { waitForTransaction } from './contract/provider';

export function postAndWaitForTransaction(config) {
  const { method = 'POST', url, body } = config;
  return new Promise((resolve, reject) => {
    axios({ method: method, url: url, data: body })
      .then((res) => {
        waitForTransaction(res.data)
          .then((tx) => {
            if (tx.status === 0) {
              reject('Blockchain Transaction Failed');
            } else {
              resolve(tx);
            }
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}
