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
                  console.log('err in backendApi', err);
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
        console.error(err?.response?.data || err);
        reject(err?.response?.data || err);
      });
  });
}

export function logToServer(any) {
  axios({ url: '/api/logToServer', params: { log: JSON.stringify(any) } });
}

export function errorToJson(err) {
  if (err?.isAxiosError) {
    if (err?.toJSON) {
      const jsonError = err.toJSON();
      const { message, description, status } = jsonError;
      return { message, description, status };
    }
    const message = err?.response?.data?.error;
    const description = err?.response?.data?.errorClass;
    const status = err?.response?.data?.status || err?.response?.status || 500;
    return { message, description, status };
  }
  // TODO: Erweitern um alle möglichen Error Cases
  return null;
}

export function translateChain(chain) {
  switch (chain) {
    case 'polygon':
      return 'POLYGON_MAINNET';
    case 'gnosis':
      return 'GNOSIS_MAINNET';
    default:
      return 'POLYGON_MAINNET';
  }
}
