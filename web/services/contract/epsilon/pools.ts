import { ethers } from 'ethers';
import { postAndWaitForTransaction } from '../../backendApi';
import useWeb3 from '../../../hooks/useWeb3';
import { SupportedChain } from '../types';

export function addToWhiteListWithSecretEpsilon(
  poolAddress: string,
  userAddress: string,
  secret: string,
  validFor: number,
  chain: SupportedChain,
  afterSignature: (secret: string) => void
) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, sendSignatureRequest } = useWeb3();
    const popup = openPopup('sign');

    const hashedSecret = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(secret)
    );
    const types = ['address', 'address', 'bytes32', 'uint256'];
    const values = [userAddress, poolAddress, hashedSecret, validFor];

    sendSignatureRequest(types, values, true, popup)
      .then(async (signature) => {
        afterSignature(secret);
        const body = {
          poolAddress,
          userAddress,
          secret: hashedSecret,
          validFor,
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
