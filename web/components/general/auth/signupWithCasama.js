import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import { signMillis } from '/services/sign';
import { encryptKey, generateKeys, encryptSeed } from '/services/crypto';
const BIP39 = require('bip39');

function Error({ msg }) {
  return msg ? (
    <p className="text-red-700 text-left mt-1 -mb-1">{msg}</p>
  ) : null;
}

function validate({
  firstName,
  lastName,
  email,
  password,
  passwordConfirmation,
}) {
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

function createUser(firstName, lastName, email, password, givenSeedPhrase) {
  return new Promise((resolve, reject) => {
    const seedPhrase = givenSeedPhrase || BIP39.generateMnemonic();
    const encryptedSeedPhrase = encryptSeed(seedPhrase, password);

    const { privKey, pubKey, address } = generateKeys(seedPhrase.trim());
    encryptKey(privKey, password, true);

    const reqData = {
      firstName,
      lastName,
      email,
      public_key: pubKey,
      seedPhrase: encryptedSeedPhrase,
    };
    const { signedMessage, signature } = signMillis(privKey);
    const headers = { signed: signedMessage, signature: signature };

    axios({
      method: 'post',
      url: '/api/users/create',
      data: reqData,
      headers: headers,
    })
      .then((res) => {
        const wunderId = res.data.wunder_id;

        if (wunderId) {
          resolve({
            wunderId,
            address,
          });
        } else {
          reject('Wallet Creation Failed. Please try again later');
        }
      })
      .catch((err) => {
        console.log(err);
        reject(
          err?.response?.data?.error?.message ||
            err?.response?.data?.error ||
            err
        );
      });
  });
}

export default function SignUpWithCasama({
  onSuccess,
  seedPhrase = null,
  pass = '',
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(pass);
  const [passwordConfirmation, setPasswordConfirmation] = useState(pass);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [creationError, setCreationError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const [valid, errors] = validate({
      firstName,
      lastName,
      email,
      password,
      passwordConfirmation,
    });

    setErrors(errors);

    if (valid) {
      createUser(firstName, lastName, email, password, seedPhrase)
        .then(({ wunderId, address }) => {
          onSuccess({ wunderId, address, loginMethod: 'Casama' });
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
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <input
              className="textfield py-4 px-3"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
            />
            <Error msg={errors.firstName} />
          </div>
          <div>
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
        <div>
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
        <Error msg={creationError} />
        <button
          type="submit"
          disabled={loading}
          className="flex text-center items-center justify-center bg-casama-blue hover:bg-casama-dark-blue text-white rounded-lg px-5 py-2 font-medium text-md"
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
      </div>
    </form>
  );
}
