import { Collapse } from '@mui/material';
import axios from 'axios';
import { Dispatch, SetStateAction, useState } from 'react';
import SignUpWithCasama from './signupWithCasama';
import { AuthCallback } from './types';
import {
  encryptKey,
  encryptSeed,
  decrypt,
  generateKeys,
} from '../../../services/crypto';
const BIP39 = require('bip39');

function Error({ msg }: { msg?: string }) {
  return msg ? (
    <p className="text-red-700 text-left mt-1 -mb-1">{msg}</p>
  ) : null;
}

type CredentialErrors = {
  userIdentifier?: string;
  password?: string;
};

function validateCredentials(
  userIdentifier: string,
  password: string
): [boolean, CredentialErrors] {
  let valid = true;
  const errors: CredentialErrors = {};

  if (userIdentifier.length < 1) {
    valid = false;
    errors.userIdentifier = 'Cant be blank';
  }

  if (password.length < 1) {
    valid = false;
    errors.password = 'Cant be blank';
  }

  return [valid, errors];
}

type SeedErrors = {
  password?: string;
  passwordConfirmation?: string;
  seedPhrase?: string;
};

function validateSeed(
  seedPhrase: string,
  password: string,
  passwordConfirmation: string
): [boolean, SeedErrors] {
  let valid = true;
  const errors: SeedErrors = {};

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

async function loginUserWithCredentials(identifier: string, password: string) {
  try {
    const { data } = await axios({
      method: 'post',
      url: '/api/users/recover',
      params: { identifier },
      data: { password },
    });

    if (data.encryptedSeedPhrase) {
      const seedPhrase = decrypt(data.encryptedSeedPhrase, password);
      encryptSeed(seedPhrase, password);

      const { privKey, address } = generateKeys(seedPhrase.trim());
      encryptKey(privKey, password, true);
      const { data: userData } = await axios({
        method: 'post',
        url: '/api/users/find',
        data: { address },
      });
      const wunderId = userData.wunder_id;
      if (wunderId) {
        return {
          wunderId,
          address,
        };
      } else {
        throw {
          status: 500,
          error: 'Login failed. Please try again later',
        };
      }
    }
  } catch (loginError) {
    console.log(loginError, loginError.response);
    throw {
      status: loginError?.response?.status || 500,
      error: loginError?.response?.data?.error || loginError,
    };
  }
}

async function loginUserWithSeed(seedPhrase: string, password: string) {
  const encryptedSeedPhrase = encryptSeed(seedPhrase, password);

  const { privKey, address } = generateKeys(seedPhrase.trim());
  encryptKey(privKey, password, true);

  try {
    const { data } = await axios({
      method: 'post',
      url: '/api/users/find',
      data: { address },
    });
    const wunderId = data.wunder_id;
    if (wunderId) {
      try {
        await axios({
          url: '/api/users/recover/confirmBackup',
          params: { identifier: wunderId },
        });
      } catch (confirmBackupError) {
        try {
          await axios({
            method: 'post',
            url: '/api/users/recover/migrate',
            params: { identifier: wunderId },
            data: { seedPhrase: encryptedSeedPhrase },
          });
          await axios({
            url: '/api/users/recover/confirmBackup',
            params: { identifier: wunderId },
          });
        } catch (migrationError) {
          console.log('Migration Failed:', migrationError);
        }
      }

      return {
        wunderId,
        address,
      };
    } else {
      throw 'Login failed. Please try again later';
    }
  } catch (userError) {
    if (userError?.response?.data == 'User not Found') {
      return { address };
    } else {
      throw (
        userError?.response?.data?.error?.message ||
        userError?.response?.data?.error ||
        userError?.response?.data ||
        userError
      );
    }
  }
}

type CredentialsFormProps = {
  setLoginWithSeed: Dispatch<SetStateAction<boolean>>;
  onSuccess: AuthCallback;
  toggleSignup: () => void;
};

function CredentialsForm({
  setLoginWithSeed,
  onSuccess,
  toggleSignup,
}: CredentialsFormProps) {
  const [userIdentifier, setUserIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<CredentialErrors>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [suggestLoginWithSeed, setSuggestLoginWithSeed] = useState(false);
  const [suggestSignup, setSuggestSignup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const [valid, errors] = validateCredentials(userIdentifier, password);

    setErrors(errors);

    if (valid) {
      loginUserWithCredentials(userIdentifier.toLowerCase(), password)
        .then(({ wunderId, address }) => {
          onSuccess({ wunderId, address, loginMethod: 'Casama' });
        })
        .catch((err) => {
          setVerificationRequired(false);
          setSuggestLoginWithSeed(false);
          setSuggestSignup(false);
          if (err.status == 401) {
            // Account Limit Reached
            setVerificationRequired(true);
            setLoginError(err.error);
          } else if (err.status == 403) {
            // Wrong Password
            setLoginError(err.error);
          } else if (err.status == 404) {
            // User does not exist
            setSuggestSignup(true);
          } else if (err.status == 412) {
            // Credentials do not exist
            setSuggestLoginWithSeed(true);
          } else if (err.status == 429) {
            // IP Address Limit Reached
            setLoginError(err.error);
          } else {
            // Unknown
            setLoginError(err.error);
          }
        })
        .then(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  return (
    <form className="w-full my-2" onSubmit={handleSubmit}>
      <div className="flex items-center justify-center w-full flex-col gap-4">
        <div className="flex  w-full">
          <input
            className="textfield py-4 px-3"
            placeholder="Email or Username"
            value={userIdentifier}
            onChange={(e) => {
              setUserIdentifier(e.target.value);
            }}
          />
          <Error msg={errors.userIdentifier} />
        </div>
        <div className="flex  w-full">
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
        <Error msg={loginError} />
        {suggestLoginWithSeed ? (
          <>
            <p className="text-gray-500">
              It looks like your Account was created with an early Version of
              Casama.
            </p>
            <p className="text-gray-500">Please Login with your Seed Phrase</p>
            <button
              onClick={() => setLoginWithSeed(true)}
              type="button"
              className="btn-casama-white px-5 py-2"
            >
              Restore Account with Seed Phrase
            </button>
          </>
        ) : (
          <a
            onClick={() => setLoginWithSeed(true)}
            className="text-casama-blue underline cursor-pointer"
          >
            Restore Account with Seed Phrase
          </a>
        )}
        {suggestSignup && (
          <>
            <p className="text-gray-500">
              It looks like your Account does not Exist.
            </p>
            <p className="text-gray-500">Do you want to Sign Up now?</p>
            <button
              onClick={toggleSignup}
              type="button"
              className="btn-casama-white px-5 py-2"
            >
              Sign Up
            </button>
          </>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex text-center items-center justify-center bg-casama-blue hover:bg-casama-dark-blue text-white rounded-lg px-5 py-2 font-medium text-md w-full"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </div>
    </form>
  );
}

type SeedPhraseFormProps = {
  setCreateNewUser: Dispatch<SetStateAction<boolean>>;
  setAddress: Dispatch<SetStateAction<string>>;
  seedPhrase: string;
  setSeedPhrase: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  onSuccess: AuthCallback;
  setLoginWithSeed: Dispatch<SetStateAction<boolean>>;
};

function SeedPhraseForm({
  setCreateNewUser,
  setAddress,
  seedPhrase,
  setSeedPhrase,
  password,
  setPassword,
  onSuccess,
  setLoginWithSeed,
}: SeedPhraseFormProps) {
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<SeedErrors>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const [valid, errors] = validateSeed(
      seedPhrase,
      password,
      passwordConfirmation
    );

    setErrors(errors);

    if (valid) {
      loginUserWithSeed(seedPhrase, password)
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
        <a
          onClick={() => setLoginWithSeed(false)}
          className="text-casama-blue underline cursor-pointer"
        >
          Login with Username or Email
        </a>
        <button
          type="submit"
          disabled={loading}
          className="flex text-center items-center justify-center bg-casama-blue hover:bg-casama-dark-blue text-white rounded-lg px-5 py-2 font-medium text-md"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </div>
    </form>
  );
}

type LoginWithCasamaProps = {
  onSuccess: AuthCallback;
  toggleSignup: () => void;
};

export default function LoginWithCasama({
  onSuccess,
  toggleSignup,
}: LoginWithCasamaProps) {
  const [loginWithSeed, setLoginWithSeed] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [createNewUser, setCreateNewUser] = useState(false);
  const [address, setAddress] = useState('');

  return (
    <>
      <Collapse in={!createNewUser} className="w-full">
        {loginWithSeed != null &&
          (loginWithSeed ? (
            <SeedPhraseForm
              setCreateNewUser={setCreateNewUser}
              setAddress={setAddress}
              seedPhrase={seedPhrase}
              setSeedPhrase={setSeedPhrase}
              password={password}
              setPassword={setPassword}
              onSuccess={onSuccess}
              setLoginWithSeed={setLoginWithSeed}
            />
          ) : (
            <CredentialsForm
              setLoginWithSeed={setLoginWithSeed}
              toggleSignup={toggleSignup}
              onSuccess={onSuccess}
            />
          ))}
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
