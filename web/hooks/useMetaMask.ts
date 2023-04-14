import { SupportedChain } from './../services/contract/types';
import { ethers } from 'ethers';
import { tokenAbi, usdcAddress } from '../services/contract/init';

interface EthereumWindow extends Window {
  ethereum?: {
    request: (args: any) => Promise<any>;
  };
}

async function approveUsdc(spender, amount, chain: SupportedChain) {
  if ('ethereum' in window) {
    const usdcAmount = ethers.BigNumber.from(amount);
    const provider = new ethers.providers.Web3Provider(
      (window as EthereumWindow).ethereum
    );
    const tokenContract = new ethers.Contract(
      usdcAddress(chain),
      tokenAbi,
      provider
    );
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
  } else {
    throw 'Metamask Not Installed';
  }
}

export default function useMetaMask() {
  const signMillis = async () => {
    if ('ethereum' in window) {
      const provider = new ethers.providers.Web3Provider(
        (window as EthereumWindow).ethereum
      );
      const signer = provider.getSigner();
      const millis = new Date().getTime();
      try {
        const signature = await signer.signMessage(String(millis));
        return { signedMessage: millis, signature: signature.slice(2) };
      } catch (error) {
        throw error;
      }
    } else {
      throw 'Metamask Not Installed';
    }
  };

  const sendSignatureRequest = async (types, values, packed = true) => {
    if ('ethereum' in window) {
      const provider = new ethers.providers.Web3Provider(
        (window as EthereumWindow).ethereum
      );
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
      try {
        const signature = await signer.signMessage(bytes);
        return { signature };
      } catch (error) {
        throw error;
      }
    } else {
      throw 'Metamask Not Installed';
    }
  };

  const smartContractTransaction = async (
    tx,
    usdc: { spender?: string; amount?: number } = {},
    chain: SupportedChain
  ) => {
    if ('ethereum' in window) {
      if (usdc?.spender && usdc?.amount) {
        approveUsdc(usdc.spender, usdc.amount, chain)
          .then((res) => {
            if (!tx) {
              return res;
            }
          })
          .catch((err) => {
            throw err;
          });
      }
      if (tx) {
        const sanitizedTx = { data: tx.data, from: tx.from, to: tx.to };
        try {
          const txHash = await (window as EthereumWindow).ethereum.request({
            method: 'eth_sendTransaction',
            params: [sanitizedTx],
          });
          return { hash: txHash };
        } catch (error) {
          throw error;
        }
      }
    } else {
      throw 'Metamask Not Installed';
    }
  };

  return {
    signMillis,
    sendSignatureRequest,
    smartContractTransaction,
  };
}
