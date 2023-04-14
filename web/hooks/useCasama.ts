import { SupportedChain } from './../services/contract/types';
import { ethers } from 'ethers';
import { tokenAbi, usdcAddress } from '../services/contract/init';
import { httpProvider } from '../services/contract/provider';
import { retreiveKey } from '../services/crypto';
import { signTypedData, signMillis } from '../services/sign';
import axios from 'axios';

interface IOsAppWindow extends Window {
  webkit?: {
    messageHandlers: {
      swiftJsBridgeV1: {
        postMessage: (payload: string) => void;
      };
    };
  };
}

function iOSAppInstalled(win: Window): win is IOsAppWindow {
  return (
    'webkit' in win &&
    typeof win.webkit == 'object' &&
    'messageHandlers' in win.webkit
  );
}

async function approveUsdc(
  spender: string,
  amount: number | string,
  chain: SupportedChain
): Promise<{ hash?: string }> {
  const privKey = retreiveKey();
  if (!privKey)
    throw 'Session Expired. Please Refresh the Page and type in your Password';
  const usdcAmount = ethers.BigNumber.from(amount);
  const provider = httpProvider(chain);
  const tokenContract = new ethers.Contract(
    usdcAddress(chain),
    tokenAbi,
    provider
  );
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
    return { hash: undefined };
  }
}

const triggerBiometry = (reason, callback = (success: boolean) => {}) => {
  if (iOSAppInstalled(window)) {
    if (!(window as any).swiftJsBridgeV1.triggerBiometryCallback)
      (window as any).swiftJsBridgeV1.triggerBiometryCallback = (success) => {
        callback(success);
        (window as any).swiftJsBridgeV1.triggerBiometryCallback = undefined;
      };
    (window as IOsAppWindow).webkit.messageHandlers.swiftJsBridgeV1.postMessage(
      JSON.stringify({ func: 'triggerBiometry', parameter: reason })
    );
  } else {
    callback(true);
  }
};

export default function useCasama() {
  const sendSignatureRequest = async (
    types,
    values,
    packed = true
  ): Promise<{ signature: string }> => {
    return new Promise((resolve, reject) => {
      triggerBiometry('Sign a Transaction', async (success) => {
        if (!success) throw 'Signature Denied';
        const privKey = retreiveKey();
        if (!privKey)
          throw 'Session Expired. Please Refresh the Page and type in your Password';
        try {
          const signature = await signTypedData(privKey, types, values, packed);
          resolve({ signature });
        } catch (error) {
          console.log(error);
          throw 'Invalid Signature';
        }
      });
    });
  };

  const smartContractTransaction = async (
    tx,
    usdc: { spender?: string; amount?: number } = {},
    chain: SupportedChain
  ): Promise<{ hash?: string }> => {
    return new Promise((resolve, reject) => {
      triggerBiometry('Send a Transaction', (success) => {
        if (!success) reject('Signature Denied');
        const privKey = retreiveKey();
        if (usdc?.spender && usdc?.amount) {
          approveUsdc(usdc.spender, usdc.amount, chain)
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
          if (!privKey)
            reject(
              'Session Expired. Please Refresh the Page and type in your Password'
            );
          const provider = httpProvider(chain);
          const wallet = new ethers.Wallet(privKey, provider);
          wallet
            .sendTransaction(tx)
            .then((res) => {
              resolve({ hash: res.hash });
            })
            .catch((err) => {
              reject(err);
            });
        }
        requestGas(privKey);
      });
    });
  };

  const requestGas = (privKey = null) => {
    return new Promise((resolve, reject) => {
      try {
        if (privKey) {
          const { signedMessage, signature } = signMillis(privKey);
          const headers = { signed: `${signedMessage}`, signature: signature };

          axios({ url: '/api/users/requestGas', headers: headers })
            .then((res) => {
              resolve(res.data);
            })
            .catch((err) => {
              resolve(err);
            });
        } else {
          resolve(null);
        }
      } catch (error) {
        resolve(error);
      }
    });
  };

  return {
    sendSignatureRequest,
    smartContractTransaction,
  };
}
