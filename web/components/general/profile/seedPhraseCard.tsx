import { Alert, AlertTitle, Chip, Divider } from '@mui/material';
import { useState } from 'react';
import { decryptSeed } from '../../../services/crypto';
import PasswordRequiredAlert from '../dialogs/passwordRequiredAlert';
import RevealLoginCode from './revealLoginCode';

export default function SeedPhraseCard() {
  const [seedPhrase, setSeedPhrase] = useState(null);
  const [passwordRequired, setPasswordRequired] = useState(false);

  const toggleShowSeedPhrase = () => {
    if (seedPhrase) {
      setSeedPhrase(null);
    } else {
      setPasswordRequired(true);
    }
  };

  const handlePassword = (password: string) => {
    try {
      const seed = decryptSeed(password);
      if (!seed) throw 'Invalid Password';
      setSeedPhrase(seed);
      setPasswordRequired(false);
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <div className="container-white my-5">
        <div className="text-left w-full ">
          <div className="flex flex-row justify-between items-center mt-7">
            <h3 className="text-lg p-1 font-semibold">Seed Phrase</h3>
            {seedPhrase && (
              <Chip
                className="bg-casama-extra-light-blue text-casama-blue px-2"
                size="medium"
                label={<RevealLoginCode privKey={seedPhrase} />}
              />
            )}
          </div>
          <Divider className="w-full mt-2 mb-4" />
          <Alert severity="warning" className="items-center">
            <AlertTitle>Keep your Seed Phrase to yourself!</AlertTitle> Anyone
            with access to this Phrase can login to your Account and steal your
            funds.
          </Alert>
          {seedPhrase && (
            <div className="bg-gray-100 border-gray-300 border-2 rounded-xl p-3 my-3">
              {seedPhrase}
            </div>
          )}
          <div className="w-full">
            <button
              onClick={toggleShowSeedPhrase}
              className="btn-warning px-5 py-2 block mx-auto mt-3"
            >
              {seedPhrase ? 'Hide' : 'Reveal'} Seed Phrase
            </button>
          </div>
        </div>
      </div>
      <PasswordRequiredAlert
        passwordRequired={passwordRequired}
        onSuccess={handlePassword}
      />
    </>
  );
}
