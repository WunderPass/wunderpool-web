import { ethers } from 'ethers';
import { tokenAbi, usdcAddress } from '../services/contract/init';

async function approveUsdc(spender, amount) {
  const usdcAmount = ethers.BigNumber.from(amount);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const tokenContract = new ethers.Contract(usdcAddress, tokenAbi, provider);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const allowance = await tokenContract.allowance(address, spender);

  if (allowance.lt(usdcAmount)) {
    const gasPrice = await provider.getGasPrice();
    const tx = await tokenContract
      .connect(signer)
      .approve(spender, usdcAmount, { gasPrice: gasPrice.mul(5).div(3) });

    return await tx.wait();
  } else {
    return true;
  }
}

export default function useMetaMask() {
  const sendSignatureRequest = (types, values, packed = true) => {
    return new Promise(async (resolve, reject) => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
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
      resolve({ signature: await signer.signMessage(bytes) });
    });
  };

  const smartContractTransaction = (tx, usdc = {}, network = 'polygon') => {
    return new Promise(async (resolve, reject) => {
      if (usdc?.spender && usdc?.amount) {
        const res = await approveUsdc(usdc.spender, usdc.amount);
        if (!tx) {
          resolve(res);
        }
      }
      if (tx) {
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [tx],
        });
        resolve(txHash);
      }
    });
  };

  return {
    sendSignatureRequest,
    smartContractTransaction,
  };
}
