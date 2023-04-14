import { SupportedChain } from './../types';
import axios from 'axios';
import { waitForTransaction } from '../provider';
import { initProposalDelta } from './init';
import useWeb3 from '../../../hooks/useWeb3';

export function voteDelta(
  poolAddress: string,
  proposalId: number,
  mode: number,
  userAddress: string,
  chain: SupportedChain
) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, sendSignatureRequest } = useWeb3();
    const popup = openPopup('sign');

    const types = ['address', 'address', 'uint', 'uint'];
    const values = [userAddress, poolAddress, proposalId, mode];

    sendSignatureRequest(types, values, true, popup)
      .then((sig) => {
        axios({
          method: 'post',
          url: '/api/proposals/vote',
          data: {
            address: poolAddress,
            id: proposalId,
            userAddress,
            vote: mode === 1 ? 'YES' : 'NO',
            signature: sig.signature,
          },
        })
          .then((txHash) => {
            waitForTransaction(txHash.data, 'polygon')
              .then((result) => {
                resolve(result);
              })
              .catch((err) => {
                console.log(err);
                reject(err);
              });
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

export function hasVotedDelta(
  poolAddress: string,
  proposalId: number,
  address: string
) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalDelta();
    resolve(await wunderProposal.hasVoted(poolAddress, proposalId, address));
  });
}
