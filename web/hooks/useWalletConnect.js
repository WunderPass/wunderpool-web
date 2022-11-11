import { ethers } from 'ethers';
import { tokenAbi, usdcAddress } from '/services/contract/init';

async function approveUsdc(spender, amount) {
  const usdcAmount = ethers.BigNumber.from(amount);
  const provider = new ethers.providers.Web3Provider(window.walletConnect);
  const tokenContract = new ethers.Contract(usdcAddress, tokenAbi, provider);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const allowance = await tokenContract.allowance(address, spender);

  if (allowance.lt(usdcAmount)) {
    const gasPrice = await provider.getGasPrice();
    try {
      const tx = await tokenContract
        .connect(signer)
        .approve(spender, usdcAmount, { gasPrice: gasPrice.mul(5).div(3) });

      return await tx.wait();
    } catch (error) {
      throw error;
    }
  } else {
    return true;
  }
}

export default function useWalletConnect() {
  const signMillis = () => {
    return new Promise((resolve, reject) => {
      const provider = new ethers.providers.Web3Provider(window.walletConnect);
      const signer = provider.getSigner();
      console.log('signer', signer);
      const millis = new Date().getTime();
      signer
        .signMessage(String(millis))
        .then((signature) => {
          resolve({ signedMessage: millis, signature: signature.slice(2) });
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const sendSignatureRequest = (types, values, packed = true) => {
    return new Promise((resolve, reject) => {
      const provider = new ethers.providers.Web3Provider(window.walletConnect);
      const signer = provider.getSigner();
      let dataToSign;
      if (packed) {
        dataToSign = ethers.utils.solidityKeccak256(types, values);
      } else {
        dataToSign = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(types, values)
        );
      }
      const bytes = ethers.utils.arrayify(dataToSign);
      signer
        .signMessage(bytes)
        .then((signature) => {
          resolve({ signature });
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const smartContractTransaction = (tx, usdc = {}, network = 'polygon') => {
    return new Promise((resolve, reject) => {
      if (usdc?.spender && usdc?.amount) {
        approveUsdc(usdc.spender, usdc.amount)
          .then((res) => {
            if (!tx) {
              resolve(res);
            }
          })
          .catch((err) => {
            reject(err);
          });
      }
      if (tx) {
        window.walletConnect
          .request({
            method: 'eth_sendTransaction',
            params: [tx],
          })
          .then((txHash) => {
            resolve(txHash);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  };

  return {
    signMillis,
    sendSignatureRequest,
    smartContractTransaction,
  };
}
