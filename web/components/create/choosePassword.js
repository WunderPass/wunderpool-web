import { useState } from 'react';
import { Stack, Typography, FormControlLabel, Checkbox } from '@mui/material';
import LoadingButton from '/components/utils/loadingButton';
import { encryptKey, generateKeys } from '/services/crypto';
import { useRouter } from 'next/router';
import PasswordInput from '/components/utils/passwordInput';
import { FullHeightForm } from '/components/styled/form';
import UseViewport from '/hooks/useViewport';

export default function ChoosePassword(props) {
  const router = useRouter();
  const {
    seedPhrase,
    isMobile,
    user,
    firstName,
    lastName,
    handle,
    email,
    phoneNumber,
    t,
    handleError,
  } = props;
  const alignSlide = isMobile ? 'center' : 'start';
  const [password, setPassword] = useState('');
  const [passwordConf, setPasswordConf] = useState('');
  const [loading, setLoading] = useState(false);
  const [savePrivKey, setSavePrivKey] = useState(true);
  const viewport = UseViewport();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    //check if phone is empty string turn into null cause of backend validation
    if (phoneNumber == '') phoneNumber = null;
    const { privKey } = generateKeys(seedPhrase.trim());
    user
      .createUser(firstName, lastName, handle, privKey, email, phoneNumber)
      .then((res) => {
        encryptKey(privKey, password, savePrivKey);
        const path = localStorage.getItem('RedirectAfterLogin') || '/';
        localStorage.removeItem('RedirectAfterLogin');
        router.push(path);
      })
      .catch((err) => {
        console.log('hier also');
        console.log(err);
        handleError(typeof err == 'string' ? err : t('errors.auth.failed'));
        setLoading(false);
      });
  };

  const passwordsCorrect = password == passwordConf;

  return (
    <FullHeightForm>
      <Stack
        alignItems="center"
        justifyContent="space-between"
        height="100%"
        maxHeight={viewport?.maxHeight || 'unset'}
      >
        <Stack spacing={2} py={2}>
          <Typography variant="h4" sx={{ textAlign: alignSlide }}>
            {t('pages.auth.choosePassword.title.primary')}
            <Typography variant="span" color={'text.secondary'}>
              {' '}
              WunderPass{' '}
            </Typography>
            {t('pages.auth.choosePassword.title.secondary')}
          </Typography>
          <Typography variant="subtitle1" sx={{ textAlign: alignSlide }}>
            {t('pages.auth.choosePassword.explanation')}
          </Typography>
          <PasswordInput
            password={password}
            setPassword={setPassword}
            autoFocus
            autoComplete="new-password"
          />
          <PasswordInput
            password={passwordConf}
            setPassword={setPasswordConf}
            label={t('vocab.auth.passwordConfirmation')}
            error={
              passwordsCorrect ? null : t('errors.auth.password.notTheSame')
            }
            autoComplete="new-password"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={savePrivKey}
                onChange={(e, v) => setSavePrivKey(v)}
              />
            }
            label={t('vocab.auth.remember')}
          />
        </Stack>
        <Stack
          spacing={1}
          py={2}
          alignItems="center"
          minWidth={isMobile ? '100%' : '70%'}
        >
          {loading ? (
            <LoadingButton {...props} />
          ) : (
            <button
              className="btn w-full"
              variant="contained"
              disabled={!passwordsCorrect}
              onClick={handleSubmit}
              type="submit"
            >
              {t('vocab.done')}
            </button>
          )}
        </Stack>
      </Stack>
    </FullHeightForm>
  );
}
