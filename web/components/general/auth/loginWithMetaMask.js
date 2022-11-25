import { Collapse } from '@mui/material';
import { useEffect, useState } from 'react';
import useMetaMask from '/hooks/useMetaMask';
import MetaMaskLogo from '/components/general/utils/metaMaskLogo';
import axios from 'axios';

function Error({ msg }) {
  return msg ? (
    <p className="text-red-700 text-left mt-1 -mb-1">{msg}</p>
  ) : null;
}

function validate({ firstName, lastName, email }) {
  let valid = true;
  const errors = {};

  if (firstName.length < 1) {
    valid = false;
    errors.firstName = 'Cant be blank';
  }

  if (lastName.length < 1) {
    valid = false;
    errors.lastName = 'Cant be blank';
  }

  if (
    email &&
    email.length > 0 &&
    !/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
      email
    )
  ) {
    valid = false;
    errors.email = 'Invalid Email';
  }

  return [valid, errors];
}

function createUser(firstName, lastName, email) {
  return new Promise(async (resolve, reject) => {
    const reqData = {
      firstName,
      lastName,
      email,
    };
    const { signMillis } = useMetaMask();
    try {
      const { signedMessage, signature } = await signMillis();
      const headers = { signed: signedMessage, signature };

      const { data } = await axios({
        method: 'post',
        url: '/api/users/create',
        data: reqData,
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
      console.log(err);
      reject(
        err?.response?.data?.error?.message || err?.response?.data?.error || err
      );
    }
  });
}

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
  const [metamaskInstalled, setMetamaskInstalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signUpRequired, setSignUpRequired] = useState(false);
  const [address, setAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [creationError, setCreationError] = useState(null);

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
        setAddress(address);

        try {
          const { data } = await axios({
            method: 'post',
            url: '/api/users/find',
            data: { address },
          });
          const wunderId = data.wunder_id;
          if (wunderId) {
            onSuccess({ wunderId, address: address, loginMethod: 'MetaMask' });
          } else {
            setSignUpRequired(true);
          }
        } catch (userNotFound) {
          setSignUpRequired(true);
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        handleError(error);
      }
    } else {
      handleError('MetaMask is not installed');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const [valid, errors] = validate({
      firstName,
      lastName,
      email,
    });

    setErrors(errors);

    if (valid) {
      createUser(firstName, lastName, email)
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
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMetamaskInstalled(window?.ethereum?.isMetaMask);
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
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                  />
                  <Error msg={errors.firstName} />
                </div>
                <div className="w-full">
                  <input
                    className="textfield py-4 px-3"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                  />
                  <Error msg={errors.lastName} />
                </div>
              </div>
              <div className="w-full">
                <input
                  className="textfield py-4 px-3"
                  placeholder="Email (Optional)"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
                <Error msg={errors.email} />
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
