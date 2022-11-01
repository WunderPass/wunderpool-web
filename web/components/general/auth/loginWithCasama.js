import { Collapse } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import SignUpWithCasama from './signupWithCasama';
import { encryptKey, generateKeys } from '/services/crypto';
const BIP39 = require('bip39');

function Error({ msg }) {
  return msg ? (
    <p className="text-red-700 text-left mt-1 -mb-1">{msg}</p>
  ) : null;
}

function validate({ seedPhrase, password, passwordConfirmation }) {
  let valid = true;
  const errors = {};

  if (seedPhrase.length < 1) {
    valid = false;
    errors.seedPhrase = 'Cant be blank';
  } else if (seedPhrase.trim().split(' ').length != 12) {
    valid = false;
    errors.seedPhrase = 'Must be 12 Words';
  } else if (!BIP39.validateMnemonic(seedPhrase.trim())) {
    const wordlist = BIP39.wordlists.english;
    valid = false;

    const invalidWords = seedPhrase
      .trim()
      .split(' ')
      .filter((word) => !wordlist.includes(word));
    if (invalidWords.length == 0) {
      errors.seedPhrase = 'Invalid Seed Phrase';
    } else if (invalidWords.length == 1) {
      errors.seedPhrase = `Misspelled Word: ${invalidWords[0]}`;
    } else {
      errors.seedPhrase = `Misspelled Words: ${invalidWords.join(', ')}`;
    }
  }

  if (password.length < 1) {
    valid = false;
    errors.password = 'Cant be blank';
  }

  if (passwordConfirmation != password) {
    valid = false;
    errors.passwordConfirmation = 'Passwords do not match';
  }

  return [valid, errors];
}

function loginUser(seedPhrase, password) {
  return new Promise((resolve, reject) => {
    localStorage.setItem('seedPhrase', seedPhrase);

    const { privKey, address } = generateKeys(seedPhrase.trim());
    encryptKey(privKey, password, true);

    axios({
      method: 'post',
      url: '/api/users/find',
      data: { address },
    })
      .then((res) => {
        console.log(res.data);
        const wunderId = res.data.wunder_id;

        if (wunderId) {
          resolve({
            wunderId,
            address,
          });
        } else {
          reject('Login failed. Please try again later');
        }
      })
      .catch((err) => {
        if (err?.response?.data == 'User not Found') {
          resolve({ address });
        } else {
          reject(
            err?.response?.data?.error?.message ||
              err?.response?.data?.error ||
              err?.response?.data ||
              err
          );
        }
      });
  });
}

export default function LoginWithCasama({ onSuccess }) {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [createNewUser, setCreateNewUser] = useState(false);
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const [valid, errors] = validate({
      seedPhrase,
      password,
      passwordConfirmation,
    });

    setErrors(errors);

    if (valid) {
      loginUser(seedPhrase, password)
        .then(({ wunderId, address }) => {
          if (wunderId && address) {
            onSuccess({ wunderId, address, loginMethod: 'Casama' });
          } else {
            setAddress(address);
            setCreateNewUser(true);
          }
        })
        .catch((err) => {
          setLoginError(err);
        })
        .then(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  return (
    <>
      <Collapse in={!createNewUser}>
        <form className="w-full my-2" onSubmit={handleSubmit}>
          <div className="w-full flex flex-col gap-4">
            <div>
              <input
                className="textfield py-4 px-3"
                placeholder="Seed Phrase"
                value={seedPhrase}
                onChange={(e) => {
                  setSeedPhrase(e.target.value);
                }}
              />
              <Error msg={errors.seedPhrase} />
            </div>
            <div>
              <input
                className="textfield py-4 px-3"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
              <Error msg={errors.password} />
            </div>
            <div>
              <input
                className="textfield py-4 px-3"
                placeholder="Password Confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => {
                  setPasswordConfirmation(e.target.value);
                }}
              />
              <Error msg={errors.passwordConfirmation} />
            </div>
            <Error msg={loginError} />
            <button
              type="submit"
              disabled={loading}
              className="flex text-center items-center justify-center bg-casama-blue hover:bg-casama-dark-blue text-white rounded-lg px-5 py-2 font-medium text-md"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>
        </form>
      </Collapse>
      <Collapse in={createNewUser}>
        <p className="text-casama-blue font-bold">
          This User does not exist on Casama yet
        </p>
        <p className="text-gray-400">
          Please fill in the following information to create an account for your
          Address
        </p>
        <p className="text-casama-blue mb-3 text-ellipsis overflow-hidden">
          {address}
        </p>
        <SignUpWithCasama
          onSuccess={onSuccess}
          seedPhrase={seedPhrase}
          pass={password}
        />
      </Collapse>
    </>
  );
}
