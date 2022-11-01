import { ethers } from 'ethers';
import { tokenAbi, usdcAddress } from '../services/contract/init';
import { httpProvider } from '../services/contract/provider';
import { retreiveKey } from '../services/crypto';
import { signTypedData } from '/services/sign';

async function approveUsdc(spender, amount) {
  const privKey = retreiveKey();
  if (!privKey)
    throw 'Session Expired. Please Refresh the Page and type in your Password';
  const usdcAmount = ethers.BigNumber.from(amount);
  const provider = httpProvider;
  const tokenContract = new ethers.Contract(usdcAddress, tokenAbi, provider);
  const wallet = new ethers.Wallet(privKey, provider);
  const address = await wallet.getAddress();
  const allowance = await tokenContract.allowance(address, spender);

  if (allowance.lt(usdcAmount)) {
    const gasPrice = await provider.getGasPrice();
    try {
      const tx = await tokenContract
        .connect(wallet)
        .approve(spender, usdcAmount, { gasPrice: gasPrice.mul(5).div(3) });

      return await tx.wait();
    } catch (error) {
      throw error;
    }
  } else {
    return true;
  }
}

export default function useCasama() {
  const sendSignatureRequest = (types, values, packed = true) => {
    return new Promise((resolve, reject) => {
      const privKey = retreiveKey();
      if (!privKey)
        reject(
          'Session Expired. Please Refresh the Page and type in your Password'
        );
      signTypedData(privKey, types, values, packed)
        .then((signature) => {
          resolve({ signature });
        })
        .catch((err) => {
          console.log(err);
          reject('Invalid Signature');
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
        const privKey = retreiveKey();
        if (!privKey)
          reject(
            'Session Expired. Please Refresh the Page and type in your Password'
          );
        const provider = httpProvider;
        const wallet = new ethers.Wallet(privKey, provider);
        wallet
          .sendTransaction(tx)
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  };

  return {
    sendSignatureRequest,
    smartContractTransaction,
  };
}
