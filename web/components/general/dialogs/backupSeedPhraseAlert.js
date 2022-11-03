import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Slide,
  Stack,
} from '@mui/material';
import { forwardRef, useState, useEffect } from 'react';
import PasswordInput from '/components/general/utils/passwordInput';
import { decryptSeed, encryptSeed } from '/services/crypto';
import CopyToClipboard from 'react-copy-to-clipboard';
import { MdCheck, MdContentCopy } from 'react-icons/md';
import axios from 'axios';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function BackupSeedPhraseAlert(props) {
  const { user } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState(null);
  const [copied, setCopied] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setLoading(false);
  };

  const handleSubmit = () => {
    try {
      const phrase = decryptSeed(password);
      if (!phrase) throw 'Invalid Password';
      setSeedPhrase(phrase);
    } catch (err) {
      setError(err);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axios({
        url: '/api/users/recover/confirmBackup',
        params: { identifier: user.wunderId },
      });
      handleClose();
    } catch (error) {
      try {
        await axios({
          method: 'post',
          url: '/api/users/recover/migrate',
          params: { identifier: user.wunderId },
          data: { seedPhrase: encryptSeed(seedPhrase, password) },
        });
        await axios({
          url: '/api/users/recover/confirmBackup',
          params: { identifier: user.wunderId },
        });
        handleClose();
      } catch (err) {
        handleClose();
      }
      handleClose();
    }
  };

  useEffect(() => {
    if (
      user.usdBalance &&
      user.usdBalance > 5 &&
      user.confirmedBackup == false
    ) {
      setOpen(Boolean(localStorage.getItem('seedPhrase')));
    }
  }, [user.usdBalance, user.confirmedBackup]);

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      className="rounded-xl"
      open={open}
      TransitionComponent={Transition}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>Backup Seed Phrase</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="w-full">
          <p>
            When your Account was created, we generated a random Seed Phrase to
            create your Wallet. With your Seed Phrase, you can gain Access to
            your Wallet, i.e. your Funds.
          </p>
          <p>
            Be aware that without your Seed Phrase you{' '}
            <b>will loose access to your Account</b> if your device is lost or
            stolen.
          </p>
          <div className="container-gray flex flex-col gap-3">
            {seedPhrase ? (
              <>
                <div>
                  <div className="bg-white border-gray-300 border-2 rounded-xl p-3">
                    <CopyToClipboard
                      text={seedPhrase}
                      onCopy={() => setCopied(true)}
                    >
                      <span className="cursor-pointer text-md">
                        <div className="flex flex-row items-center justify-between">
                          <div className="">{seedPhrase}</div>
                          {copied ? (
                            <MdCheck className="text-green-500 text-6xl sm:text-2xl ml-2" />
                          ) : (
                            <MdContentCopy className="text-gray-500 text-6xl sm:text-2xl ml-2" />
                          )}
                        </div>
                      </span>
                    </CopyToClipboard>
                  </div>
                  {copied && (
                    <p className="ml-1 mt-1 text-green-500">
                      Copied Seed Phrase to Clipboard
                    </p>
                  )}
                </div>
                <div className="flex flex-row justify-start items-center mt-2">
                  <Checkbox
                    checked={checked}
                    onChange={() => setChecked((chkd) => !chkd)}
                  />
                  <p className="pt-1">I have saved my Seed Phrase</p>
                </div>
              </>
            ) : (
              <>
                <PasswordInput
                  password={password}
                  setPassword={setPassword}
                  error={error}
                />
                <button
                  className="w-full btn-casama px-5 py-2"
                  disabled={password.length <= 0}
                  onClick={handleSubmit}
                >
                  Show my SeedPhrase
                </button>
              </>
            )}
          </div>
        </Stack>
      </DialogContent>
      <Divider />
      <div className="w-full flex gap-3 px-5 py-2">
        <button
          className="w-full btn-warning px-5 py-2"
          onClick={() => setOpen(false)}
        >
          Not now
        </button>
        <button
          disabled={!checked || loading}
          className="w-full btn-casama px-5 py-2"
          onClick={handleConfirm}
        >
          {loading ? 'Loading...' : 'Confirm'}
        </button>
      </div>
    </Dialog>
  );
}
