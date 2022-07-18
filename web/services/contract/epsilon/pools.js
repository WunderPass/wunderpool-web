import useWunderPass from '/hooks/useWunderPass';
import axios from 'axios';
import { ethers } from 'ethers';
import { initLauncherEpsilon, initPoolEpsilon } from './init';
import { postAndWaitForTransaction } from '../../backendApi';

export function fetchWhitelistedUserPoolsEpsilon(userAddress) {
  return new Promise(async (resolve, reject) => {
    const [poolLauncher] = initLauncherEpsilon();
    const whiteListPools = await poolLauncher.whiteListedPoolsOfMember(
      userAddress
    );
    const memberPools = await poolLauncher.poolsOfMember(userAddress);

    const poolAddresses = whiteListPools.filter(
      (pool) => !memberPools.includes(pool)
    );

    const pools = await Promise.all(
      poolAddresses.map(async (addr) => {
        const [wunderPool] = initPoolEpsilon(addr);
        try {
          return {
            address: addr,
            name: await wunderPool.name(),
            version: { version: 'EPSILON', number: 5 },
            isMember: false,
            closed: await wunderPool.poolClosed(),
          };
        } catch (err) {
          return null;
        }
      })
    );
    resolve(pools.filter((elem) => elem));
  });
}

export function addToWhiteListWithSecretEpsilon(
  poolAddress,
  userAddress,
  secret,
  validFor
) {
  return new Promise(async (resolve, reject) => {
    const { openPopup, sendSignatureRequest } = useWunderPass({
      name: 'WunderPool',
      accountId: 'ABCDEF',
      userAddress,
    });
    const popup = openPopup('sign');

    const hashedSecret = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(secret)
    );
    const types = ['address', 'address', 'bytes32', 'uint256'];
    const values = [userAddress, poolAddress, hashedSecret, validFor];

    sendSignatureRequest(types, values, true, popup)
      .then(async (signature) => {
        const body = {
          poolAddress,
          userAddress,
          secret: hashedSecret,
          validFor,
          signature: signature.signature,
        };
        postAndWaitForTransaction({
          url: '/api/proxy/pools/whitelist',
          body: body,
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

export function fetchPoolShareholderAgreementEpsilon(poolAddress) {
  return new Promise(async (resolve, reject) => {
    axios({
      url: `/api/proxy/pools/show?address=${poolAddress}`,
    })
      .then((res) => {
        resolve(res.data.shareholder_agreement);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
