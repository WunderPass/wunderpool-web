import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import { signMillis } from '../../../services/sign';
import {
  encryptKey,
  generateKeys,
  encryptSeed,
} from '../../../services/crypto';
import { AuthCallback } from './types';
const BIP39 = require('bip39');

function Error({ msg }: { msg: string }) {
  return msg ? (
    <p className="text-red-700 text-left mt-1 -mb-1">{msg}</p>
  ) : null;
}

type ValidateErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
};

function validate(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  passwordConfirmation: string
): [boolean, ValidateErrors] {
  let valid = true;
  const errors: ValidateErrors = {};

  if (firstName.length < 1) {
    valid = false;
    errors.firstName = 'Cant be blank';
  }

  if (lastName.length < 1) {
    valid = false;
    errors.lastName = 'Cant be blank';
  }

  if (
    !/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
      email
    )
  ) {
    valid = false;
    errors.email = 'Invalid Email';
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

async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  givenSeedPhrase: string
) {
  const seedPhrase = givenSeedPhrase || BIP39.generateMnemonic();
  const encryptedSeedPhrase = encryptSeed(seedPhrase, password);
  let code = localStorage.getItem('referrer');

  const { privKey, pubKey, address } = generateKeys(seedPhrase.trim());
  encryptKey(privKey, password, true);

  const reqData = {
    firstName,
    lastName,
    email,
    public_key: pubKey,
    seedPhrase: encryptedSeedPhrase,
    code,
  };
  const { signedMessage, signature } = signMillis(privKey);
  const headers = { signed: `${signedMessage}`, signature: signature };

  try {
    const { data } = await axios({
      method: 'post',
      url: '/api/users/create',
      data: reqData,
      headers: headers,
    });
    const wunderId = data.wunder_id;

    if (wunderId) {
      return {
        wunderId,
        address,
      };
    } else {
      throw 'Wallet Creation Failed. Please try again later';
    }
  } catch (error) {
    console.log(error);
    throw (
      error?.response?.data?.error?.message ||
      error?.response?.data?.error ||
      error
    );
  }
}

type SignUpWithCasamaProps = {
  onSuccess: AuthCallback;
  seedPhrase?: string;
  pass?: string;
};

export default function SignUpWithCasama({
  onSuccess,
  seedPhrase = null,
  pass = '',
}: SignUpWithCasamaProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(pass);
  const [passwordConfirmation, setPasswordConfirmation] = useState(pass);
  const [errors, setErrors] = useState<ValidateErrors>({});
  const [loading, setLoading] = useState(false);
  const [creationError, setCreationError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const [valid, errors] = validate(
      firstName,
      lastName,
      email,
      password,
      passwordConfirmation
    );

    setErrors(errors);

    if (valid) {
      createUser(firstName, lastName, email, password, seedPhrase)
        .then(({ wunderId, address }) => {
          onSuccess({
            wunderId,
            address,
            loginMethod: 'Casama',
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
    setPassword(pass);
    setPasswordConfirmation(pass);
  }, [pass]);

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className=" flex flex-col justify-center items-center gap-4 w-full">
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
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <Error msg={errors.email} />
        </div>
        <div className="w-full">
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
        <div className="w-full">
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
  );
}
