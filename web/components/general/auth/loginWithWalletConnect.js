import { useState } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Image from 'next/image';
import WalletConnectIcon from '/public/images/walletconnect.png';
import axios from 'axios';
import { Collapse } from '@mui/material';
import useWalletConnect from '/hooks/useWalletConnect';
import { getEnsName } from '../../../services/contract/provider';

function Error({ msg }) {
  return msg ? (
    <p className="text-red-700 text-left mt-1 -mb-1">{msg}</p>
  ) : null;
}

function createUser(handle) {
  return new Promise(async (resolve, reject) => {
    const { signMillis } = useWalletConnect();
    try {
      const { signedMessage, signature } = await signMillis();
      const headers = { signed: signedMessage, signature };

      const { data } = await axios({
        method: 'post',
        url: '/api/users/create',
        data: { handle },
        headers: headers,
      });
      const wunderId = data.wunder_id;

      if (wunderId) {
        resolve({
          wunderId,
        });
      } else {
        reject('Wallet Creation Failed. Please try again later');
      }
    } catch (err) {
      reject(err?.response?.data || 'Request Invalid');
    }
  });
}

export default function LoginWithWalletConnect({ onSuccess, handleError }) {
  const [loading, setLoading] = useState(false);
  const [signUpRequired, setSignUpRequired] = useState(false);
  const [address, setAddress] = useState('');
  const [handle, setHandle] = useState('');
  const [creationError, setCreationError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    createUser(handle)
      .then(({ wunderId }) => {
        onSuccess({
          wunderId,
          address,
          loginMethod: 'WalletConnect',
          newUser: true,
        });
      })
      .catch((err) => {
        setCreationError(err);
      })
      .then(() => {
        setLoading(false);
      });
  };

  const loginWithWalletConnect = async () => {
    // Reset Connections if any
    localStorage.removeItem('walletconnect');
    setLoading(true);
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
    try {
      const accounts = await provider.enable();
      setAddress(accounts[0]);

      try {
        const { data } = await axios({
          method: 'post',
          url: '/api/users/find',
          data: { address: accounts[0] },
        });
        const wunderId = data.wunder_id;
        if (wunderId) {
          onSuccess({
            wunderId,
            address: accounts[0],
            loginMethod: 'WalletConnect',
          });
        } else {
          setSignUpRequired(true);
        }
      } catch (userNotFound) {
        const ensName = await getEnsName(accounts[0]);
        setHandle(ensName || '');
        setSignUpRequired(true);
      }
      setLoading(false);
    } catch (error) {
      console.log('WalletConect', error.message);
      setLoading(false);
    }
  };

  return (
    signUpRequired != null && (
      <div className="flex flex-col justify-center items-center max-w-xs w-full">
        <Collapse in={signUpRequired} className="w-full">
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col justify-center items-center gap-4 w-full">
              <h6>Please Sign Up to use Casama</h6>
              <div className="w-full">
                <input
                  className="textfield py-4 px-3 "
                  placeholder="Username"
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value);
                  }}
                />
              </div>
              <Error msg={creationError} />
              <button
                type="submit"
                disabled={loading}
                className="flex text-center items-center justify-center w-full bg-casama-blue hover:bg-casama-dark-blue text-white rounded-lg px-5 py-2 font-medium text-md"
              >
                {loading ? 'Loading...' : 'Sign Up'}
              </button>
            </div>
          </form>
        </Collapse>
        <Collapse className="w-full" in={!signUpRequired}>
          <button
            className="flex my-2 p-1 w-full justify-start items-center text-center text-casama-blue rounded-xl border-casama-blue border-2 "
            onClick={loginWithWalletConnect}
          >
            <div className="pr-2 pl-3 pt-1 ">
              <Image
                src={WalletConnectIcon}
                alt="walletconnect"
                layout="fixed"
                width={30}
                height={30}
              />
            </div>
            {loading ? 'Connecting...' : 'Connect with WalletConnect'}
          </button>
        </Collapse>
      </div>
    )
  );
}
