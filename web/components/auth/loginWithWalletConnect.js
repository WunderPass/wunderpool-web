import { useState } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Image from 'next/image';
import WalletConnectIcon from '/public/images/walletconnect.png';

export default function LoginWithWalletConnect({ onSuccess, handleError }) {
  const [loading, setLoading] = useState(false);

  const loginWithWalletConnect = async () => {
    const provider = new WalletConnectProvider({
      rpc: {
        137: 'https://polygon-rpc.com',
      },
      supportedChainIds: [137],
      chainId: 137,
      clientMeta: {
        name: 'Casma',
        description: 'Pool Crypto with your Friends',
        url: 'app.casama.io',
        icons: ['https://app.casama.io/casama_logo.png'],
      },
    });
    window.walletConnect = provider;
    const accounts = await provider.enable();
    onSuccess({ address: accounts[0], loginMethod: 'WalletConnect' });
  };

  return (
    <button
      className="flex items-center text-kaico-blue rounded-xl border-kaico-blue border-2 p-2 px-2 mt-4 gap-2"
      onClick={loginWithWalletConnect}
    >
      <Image
        src={WalletConnectIcon}
        alt="walletconnect"
        layout="fixed"
        width={30}
        height={30}
      />
      {loading ? 'Connecting...' : 'WalletConnect'}
    </button>
  );
}
