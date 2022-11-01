import { useMemo, useState, useEffect } from 'react';
import {
  Stack,
  Typography,
  TextField,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import RestoreLink from '/components/utils/restoreLink';
import { FullHeightForm } from '/components/styled/form';
import UseViewport from '/hooks/useViewport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PasswordInput from '/components/utils/passwordInput';
import { encryptKey, generateKeys } from '/services/crypto';
import LoadingButton from '/components/utils/loadingButton';
import { useRouter } from 'next/router';
const BIP39 = require('bip39');
const axios = require('axios');
const generateMnemonic = () => {
  return BIP39.generateMnemonic();
};
let timer;

export default function Register(props) {
  const { isMobile, create, user, handleError } = props;
  const alignSlide = isMobile ? 'center' : 'start';
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(true);
  const [reason, setReason] = useState('');
  const [allValid, setAllValid] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConf, setPasswordConf] = useState('');
  const [savePrivKey, setSavePrivKey] = useState(true);
  const [seedPhrase, setSeedPhrase] = useState(generateMnemonic());

  const viewport = UseViewport();

  const validEmail = useMemo(
    () =>
      Boolean(
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
          email
        )
      ),
    [email]
  );

  const checkAvailability = (handle) => {
    setLoading(true);
    setReason(null);
    setAvailable(false);
    clearTimeout(timer);
    timer = setTimeout(() => {
      axios({
        method: 'get',
        url: '/api/users/checkAvailability',
        params: { wunderId: handle },
      }).then((res) => {
        setAvailable(res?.data?.available);
        setReason(res?.data?.reason);
        setLoading(false);
      });
    }, 800);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    //check if phone is empty string turn into null cause of backend validation
    //if (phoneNumber == '') phoneNumber = null;

    const { privKey } = generateKeys(seedPhrase.trim());
    user
      .createUser('firstName', 'lastName', handle, privKey, email, null) //TODO Update the useUser so we can really create user
      .then((res) => {
        encryptKey(privKey, password, savePrivKey);
        const path = localStorage.getItem('RedirectAfterLogin') || '/';
        localStorage.removeItem('RedirectAfterLogin');
        router.push(path);
      })
      .catch((err) => {
        console.log('hier also');
        console.log(err);
        handleError(typeof err == 'string' ? err : 'Authentication failed');
        setLoading(false);
      });
  };

  const passwordsCorrect = password == passwordConf;

  useEffect(() => {
    console.log('im handle');
    if (handle == '') return;
    console.log('handle:', handle);

    checkAvailability(handle);
  }, [handle]);

  useEffect(() => {
    console.log('im allvalid');

    setAllValid(email != '');
  }, [email]);

  return (
    <FullHeightForm>
      <Stack
        alignItems="center"
        height="100%"
        justifyContent="space-between"
        maxHeight={viewport?.maxHeight || 'unset'}
      >
        <Stack spacing={2} py={2}>
          <Typography variant="h4" sx={{ textAlign: alignSlide }}>
            Creating your Account for casama will also automatically create a
            crypto wallet for you.
          </Typography>
          <Typography variant="subtitle1" sx={{ textAlign: alignSlide }}>
            Easy onboarding in a couple of seconds, just pick your Username,
            enter your email and choose a password.
          </Typography>

          <TextField
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="JohnnyD99"
            label={'Username'}
            autoComplete="handle"
          />
          {handle.length > 0 && (
            <>
              {loading && <CircularProgress size={22} />}
              {!loading && available === true && (
                <div className="flex flex-row items-center">
                  <CheckCircleIcon sx={{ color: 'green' }} />
                  <Typography
                    className="mt-1 ml-2 text-green-600"
                    variant="subtitle1"
                  >
                    Username available
                  </Typography>{' '}
                </div>
              )}
              {!loading && available === false && (
                <div className="flex flex-row items-center">
                  <CancelIcon className="text-red-500" />
                  <Typography
                    className="mt-1 ml-2 text-red-500"
                    variant="subtitle1"
                  >
                    Username is already taken.
                  </Typography>{' '}
                </div>
              )}
            </>
          )}
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={'joe.doe@gmail.com'}
            label={'Email'}
            autoComplete="email"
          />
          {email.length > 0 && !validEmail && (
            <Typography variant="subtitle1" className="text-red-500">
              Email invalid
            </Typography>
          )}

          <Alert severity="warning">
            Choose your password carefully and save it somewhere! You will not
            be able to recover your password. If you loose your password your
            access to your funds is gone.
          </Alert>
          <PasswordInput
            password={password}
            setPassword={setPassword}
            autoComplete="new-password"
          />
          <PasswordInput
            password={passwordConf}
            setPassword={setPasswordConf}
            label={'Confirm Password'}
            error={passwordsCorrect ? null : 'Passwords are not the same'}
            autoComplete="new-password"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={savePrivKey}
                onChange={(e, v) => setSavePrivKey(v)}
              />
            }
            label={'Remember me'}
          />
        </Stack>

        <Stack
          spacing={1}
          py={2}
          alignItems="center"
          minWidth={isMobile ? '100%' : '70%'}
        >
          {loading ? (
            <LoadingButton />
          ) : (
            <button
              className="btn-casama p-3 w-full"
              disabled={
                allValid !== true ||
                !validEmail ||
                available !== true ||
                !passwordsCorrect ||
                password == ''
              }
              variant="contained"
              onClick={handleSubmit}
              type="submit"
            >
              {'Create Account'}
            </button>
          )}
          {create && <RestoreLink isMobile={isMobile} {...props} />}
        </Stack>
      </Stack>
    </FullHeightForm>
  );
}
