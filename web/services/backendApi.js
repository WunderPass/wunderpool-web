import axios from 'axios';
import { decodeError, waitForTransaction } from './contract/provider';

export function postAndWaitForTransaction(config) {
  const { method = 'POST', url, body } = config;
  return new Promise((resolve, reject) => {
    axios({ method: method, url: url, data: body })
      .then((res) => {
        waitForTransaction(res.data)
          .then((tx) => {
            if (tx.status === 0) {
              decodeError(tx.transactionHash)
                .then((msg) => {
                  reject(msg);
                })
                .catch((err) => {
                  reject('Unknown Blockchain Error');
                });
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

export function logToServer(any) {
  axios({ url: '/api/logToServer', params: { log: JSON.stringify(any) } });
}
