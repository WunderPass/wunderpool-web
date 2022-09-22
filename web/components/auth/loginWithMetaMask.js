import { useEffect, useState } from 'react';
import MetaMaskLogo from '../utils/metaMaskLogo';

async function getAddress() {
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error) {
    throw 'Could not get Address';
  }
}

async function switchChain() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x89',
              chainName: 'Polygon',
              rpcUrls: ['https://polygon-rpc.com'],
              blockExplorerUrls: ['https://polygonscan.com/'],
              nativeCurrency: {
                symbol: 'MATIC',
                decimals: 18,
              },
            },
          ],
        });
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x89' }],
        });
      } catch (addError) {
        throw 'Could not add Polygon';
      }
    }
    throw 'Failed to switch to Polygon';
  }
}

export default function LoginWithMetaMask({ onSuccess, handleError }, props) {
  const { customClassName, test } = props;
  const [loading, setLoading] = useState(false);

  const loginWithWetaMask = async () => {
    if (window?.ethereum?.isMetaMask) {
      setLoading(true);
      try {
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        if (chainId != '0x89') {
          await switchChain();
        }
        const address = await getAddress();
        onSuccess({ address: address, loginMethod: 'MetaMask' });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        handleError(error);
      }
    } else {
      handleError('MetaMask is not installed');
    }
  };

  useEffect(() => {
    console.log(customClassName);
  }, [customClassName]);

  return (
    <button
      className="flex w-full p-1  my-3 px-2 items-center justify-start text-center text-kaico-blue rounded-xl border-kaico-blue border-2"
      onClick={loginWithWetaMask}
    >
      <div className="pr-4">
        <MetaMaskLogo width={0} height={0} />{' '}
      </div>
      {loading ? 'Connecting...' : 'Login with MetaMask'}
    </button>
  );
}
