import { Collapse } from '@mui/material';
import { useEffect, useState } from 'react';
import useMetaMask from '../../../hooks/useMetaMask';
import MetaMaskLogo from '../utils/metaMaskLogo';
import axios from 'axios';
import { getEnsName } from '../../../services/contract/provider';
import { AuthCallback } from './types';
import { UseNotification } from '../../../hooks/useNotification';
import { SupportedChain } from '../../../services/contract/types';
import { getMetamaskChainParams } from '../../../services/metamask';

function Error({ msg }: { msg: string }) {
  return msg ? (
    <p className="text-red-700 text-left mt-1 -mb-1">{msg}</p>
  ) : null;
}

async function createUser(handle: string) {
  const { signMillis } = useMetaMask();
  try {
    const { signedMessage, signature } = await signMillis();
    const headers = { signed: `${signedMessage}`, signature };

    const { data } = await axios({
      method: 'post',
      url: '/api/users/create',
      data: { handle },
      headers: headers,
    });
    const wunderId = data.wunder_id;

    if (wunderId) {
      return {
        wunderId,
      };
    } else {
      throw 'Wallet Creation Failed. Please try again later';
    }
  } catch (err) {
    throw err?.response?.data || 'Request Invalid';
  }
}

async function getAddress(): Promise<string> {
  try {
    const accounts = await (window as any).ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error) {
    throw 'Could not get Address';
  }
}

async function switchChain(chain: SupportedChain) {
  const chainParams = getMetamaskChainParams(chain);
  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainParams.chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chainParams],
        });
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainParams.chainId }],
        });
      } catch (addError) {
        throw `Could not add ${chain}`;
      }
    }
    throw `Failed to switch to ${chain}`;
  }
}

type LoginWithMetaMaskProps = {
  onSuccess: AuthCallback;
  handleError: UseNotification.handleError;
};

export default function LoginWithMetaMask({
  onSuccess,
  handleError,
}: LoginWithMetaMaskProps) {
  const [metamaskInstalled, setMetamaskInstalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signUpRequired, setSignUpRequired] = useState(false);
  const [address, setAddress] = useState('');
  const [handle, setHandle] = useState('');
  const [wunderId, setWunderId] = useState('');
  const [creationError, setCreationError] = useState(null);

  const loginWithWetaMask = async () => {
    if ((window as any)?.ethereum?.isMetaMask) {
      setLoading(true);
      try {
        const chainId = await (window as any).ethereum.request({
          method: 'eth_chainId',
        });

        if (!['0x89', '0x64'].includes(chainId)) {
          await switchChain('gnosis');
        }
        const address = await getAddress();
        setAddress(address);

        try {
          const { data } = await axios({
            method: 'post',
            url: '/api/users/find',
            data: { address },
          });
          const wunderId = data.wunder_id;
          setWunderId(wunderId);
          if (wunderId) {
            onSuccess({ wunderId, address: address, loginMethod: 'MetaMask' });
          } else {
            setSignUpRequired(true);
          }
        } catch (userNotFound) {
          const ensName = await getEnsName(address);
          setHandle(ensName || '');
          setSignUpRequired(true);
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        handleError(error);
      }
    } else {
      handleError('MetaMask is not installed', wunderId, handle);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    createUser(handle)
      .then(({ wunderId }) => {
        onSuccess({
          wunderId,
          address,
          loginMethod: 'MetaMask',
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

  useEffect(() => {
    setMetamaskInstalled((window as any)?.ethereum?.isMetaMask);
  }, []);

  if (!metamaskInstalled) return null;

  return (
    signUpRequired != null && (
      <div className="flex flex-col justify-center items-center w-full">
        <Collapse in={signUpRequired}>
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col justify-center items-center gap-4 w-full">
              <h6>Please Sign Up to use Casama</h6>
              <div className="flex flex-row gap-4 ">
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
            className="flex my-2 w-full p-1 pt-1.5 px-2 items-center justify-start text-center text-casama-blue rounded-xl border-casama-blue border-2"
            onClick={loginWithWetaMask}
          >
            <div className="pl-1 ">
              {/* You cannot change height and width with hot reload */}
              <MetaMaskLogo width={40} height={40} />
            </div>
            <div className="pl-2 ">
              {loading ? 'Connecting...' : 'Connect with MetaMask'}
            </div>
          </button>
        </Collapse>
      </div>
    )
  );
}
