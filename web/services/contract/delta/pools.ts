import { SupportedChain } from './../types';
import { usdc } from '../../../services/formatter';
import { approveUSDC } from '../token';
import { postAndWaitForTransaction } from '../../backendApi';
import useWeb3 from '../../../hooks/useWeb3';

export function joinPoolDelta(
  poolAddress: string,
  userAddress: string,
  value,
  secret: string,
  chain: SupportedChain
) {
  return new Promise((resolve, reject) => {
    approveUSDC(userAddress, poolAddress, usdc(value), chain)
      .then(async () => {
        const body = {
          poolAddress: poolAddress,
          userAddress: userAddress,
          amount: value,
          secret: secret,
        };

        postAndWaitForTransaction({ url: '/api/pools/join', body: body, chain })
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((error) => {
        reject(error?.error?.error?.error?.message || error);
      });
  });
}

export function addToWhiteListDelta(
  poolAddress: string,
  userAddress: string,
  newMember: string,
  chain: SupportedChain
) {
  return new Promise(async (resolve, reject) => {
    if (userAddress == newMember) {
      reject('You cant invite yourself');
      return;
    }
    const { openPopup, sendSignatureRequest } = useWeb3();
    const popup = openPopup('sign');
    const types = ['address', 'address', 'address'];
    const values = [userAddress, poolAddress, newMember];

    sendSignatureRequest(types, values, true, popup)
      .then(async (signature) => {
        const body = {
          poolAddress,
          userAddress,
          newMember,
          signature: signature.signature,
        };
        postAndWaitForTransaction({
          url: '/api/pools/whitelist',
          body: body,
          chain,
        })
          .then((res) => {
            resolve(res);
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
