import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
const ModelViewer = require('@metamask/logo');

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

export default function LoginWithMetaMask({ onSuccess, handleError }) {
  const [loading, setLoading] = useState(false);
  const metamaskLogo = useRef(null);

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
    const viewer = ModelViewer({
      pxNotRatio: true,
      width: 50,
      height: 40,
      followMouse: true,
    });
    if (
      metamaskLogo.current?.children &&
      metamaskLogo.current.children.length == 0
    ) {
      metamaskLogo.current.innerHTML = '';
      metamaskLogo.current.appendChild(viewer.container);
    }
  }, []);

  return (
    <button
      className="flex items-center text-kaico-blue rounded-xl border-kaico-blue border-2 p-1 px-2"
      onClick={loginWithWetaMask}
    >
      <div ref={metamaskLogo}></div>{' '}
      {loading ? 'Connecting...' : 'Connect with MetaMask'}
    </button>
  );
}
