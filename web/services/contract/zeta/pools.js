import useWunderPass from '/hooks/useWunderPass';
import { ethers } from 'ethers';
import { initLauncherZeta, initPoolZeta } from './init';
import { postAndWaitForTransaction } from '../../backendApi';
import useWeb3 from '../../../hooks/useWeb3';

export function fetchWhitelistedUserPoolsZeta(userAddress) {
  return new Promise(async (resolve, reject) => {
    const [poolLauncher] = initLauncherZeta();
    const whiteListPools = await poolLauncher.whiteListedPoolsOfMember(
      userAddress
    );
    const memberPools = await poolLauncher.poolsOfMember(userAddress);

    const poolAddresses = whiteListPools.filter(
      (pool) => !memberPools.includes(pool)
    );

    const pools = await Promise.all(
      poolAddresses.map(async (addr) => {
        const [wunderPool] = initPoolZeta(addr);
        try {
          return {
            address: addr,
            name: await wunderPool.name(),
            version: { version: 'ZETA', number: 5 },
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

export function addToWhiteListWithSecretZeta(
  poolAddress,
  userAddress,
  secret,
  validFor
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
