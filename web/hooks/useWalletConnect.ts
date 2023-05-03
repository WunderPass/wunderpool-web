import { SupportedChain } from './../services/contract/types';
import { ethers } from 'ethers';
import { tokenAbi, usdcAddress } from '../services/contract/init';

interface WalletConnectWindow extends Window {
  walletConnect?: {
    request: (args: any) => Promise<any>;
  };
}

async function approveUsdc(spender, amount, chain: SupportedChain) {
  if ('walletConnect' in window) {
    const usdcAmount = ethers.BigNumber.from(amount);
    const provider = new ethers.providers.Web3Provider(
      (window as WalletConnectWindow).walletConnect
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
    throw 'WalletConnect Not Installed';
  }
}

export default function useWalletConnect() {
  const signMillis = async () => {
    if ('walletConnect' in window) {
      const provider = new ethers.providers.Web3Provider(
        (window as WalletConnectWindow).walletConnect
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
      throw 'WalletConnect Not Installed';
    }
  };

  const sendSignatureRequest = async (types, values, packed = true) => {
    if ('walletConnect' in window) {
      const provider = new ethers.providers.Web3Provider(
        (window as WalletConnectWindow).walletConnect
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
      throw 'WalletConnect Not Installed';
    }
  };

  const smartContractTransaction = async (
    tx,
    usdc: { spender?: string; amount?: number } = {},
    chain: SupportedChain
  ) => {
    if ('walletConnect' in window) {
      if (usdc?.spender && usdc?.amount) {
        try {
          const res = await approveUsdc(usdc.spender, usdc.amount, chain);
          if (!tx) {
            return res;
          }
        } catch (error) {
          throw error;
        }
      }
      if (tx) {
        try {
          const txHash = await (
            window as WalletConnectWindow
          ).walletConnect.request({
            method: 'eth_sendTransaction',
            params: [tx],
          });
          return { hash: txHash };
        } catch (error) {
          throw error;
        }
      }
    } else {
      throw 'WalletConnect Not Installed';
    }
  };

  return {
    signMillis,
    sendSignatureRequest,
    smartContractTransaction,
  };
}
