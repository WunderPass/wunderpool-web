import { connectContract } from '/services/contract/init';
import useWunderPass from '/hooks/useWunderPass';
import { initPoolDelta } from '/services/contract/delta/init';
import { gasPrice } from '/services/contract/init';
import axios from 'axios';
import { waitForTransaction } from '../provider';
import { initProposalDelta } from './init';
import useWeb3 from '../../../hooks/useWeb3';

export function voteDelta(poolAddress, proposalId, mode, userAddress) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, sendSignatureRequest } = useWeb3();
    const popup = openPopup('sign');

    const types = ['address', 'address', 'uint', 'uint'];
    const values = [userAddress, poolAddress, proposalId, mode];

    sendSignatureRequest(types, values, true, popup)
      .then((sig) => {
        axios({
          method: 'post',
          url: '/api/proxy/pools/proposals/vote',
          data: {
            address: poolAddress,
            id: proposalId,
            userAddress,
            vote: mode === 1 ? 'YES' : 'NO',
            signature: sig.signature,
          },
        })
          .then((txHash) => {
            waitForTransaction(txHash.data)
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

export function voteDeltaFallback(poolAddress, proposalId, mode, userAddress) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, sendSignatureRequest } = useWeb3();
    const popup = openPopup('sign');

    const types = ['address', 'address', 'uint', 'uint'];
    const values = [userAddress, poolAddress, proposalId, mode];

    sendSignatureRequest(types, values, true, popup)
      .then(async (signature) => {
        const [wunderPool] = initPoolDelta(poolAddress);
        const tx = await connectContract(wunderPool).voteForUser(
          userAddress,
          proposalId,
          mode,
          signature.signature,
          { gasPrice: await gasPrice() }
        );

        const result = await tx.wait();
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function hasVotedDelta(poolAddress, proposalId, address) {
  return new Promise(async (resolve, reject) => {
    const [wunderProposal] = initProposalDelta();
    resolve(await wunderProposal.hasVoted(poolAddress, proposalId, address));
  });
}
