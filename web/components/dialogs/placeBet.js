import { Stack, Typography, DialogActions } from '@mui/material';
import { useState } from 'react';
import { registerParticipant } from '../../services/contract/betting/games';
import ResponsiveDialog from '../utils/responsiveDialog';
import TransactionFrame from '../utils/transactionFrame';

export default function PlaceBetDialog({
  open,
  setOpen,
  game,
  user,
  wunderPool,
  handleSuccess,
  handleError,
}) {
  const [loading, setLoading] = useState(false);
  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');

  const onClose = () => {
    setLoading(false);
    setGuessOne('');
    setGuessTwo('');
    setOpen(false);
  };

  const handleCreate = () => {
    setLoading(true);
    registerParticipant(
      game.id,
      [Number(guessOne), Number(guessTwo)],
      user.address,
      user.wunderId || wunderPool.resolveMember(user.address),
      game.tokenAddress,
      game.stake
    )
      .then((res) => {
        console.log(res);
        handleSuccess(`Placed Bet on ${game.event.name}`);
        setOpen(false);
        wunderPool.determineBettingGames();
      })
      .catch(handleError)
      .then(() => setLoading(false));
  };

  return (
    <ResponsiveDialog
      maxWidth="sm"
      open={open}
      onClose={onClose}
      title="Place Your Bet"
      actions={
        !loading && (
          <DialogActions className="flex items-center justify-center mx-4">
            <div className="flex flex-col items-center justify-center w-full">
              <button className="btn-neutral w-full py-3" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-casama w-full py-3 mt-2"
                onClick={handleCreate}
                disabled={loading || !guessOne || !guessTwo}
              >
                Bet
              </button>
            </div>
          </DialogActions>
        )
      }
    >
      {loading ? (
        <div className="px-6 pb-1">
          <Typography className="text-md text-center" color="GrayText">
            Placing Bet...
          </Typography>
        </div>
      ) : (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          mt={1}
          spacing={1}
        >
          <Typography>{game.event.teams[0]}</Typography>
          <div className="w-12">
            <input
              className="textfield text-center py-1 px-3"
              value={guessOne}
              onChange={(e) => setGuessOne(e.target.value)}
            />
          </div>
          <Typography>:</Typography>
          <div className="w-12">
            <input
              className="textfield text-center py-1 px-3"
              value={guessTwo}
              onChange={(e) => setGuessTwo(e.target.value)}
            />
          </div>
          <Typography>{game.event.teams[1]}</Typography>
        </Stack>
      )}
      {<TransactionFrame open={loading} />}
    </ResponsiveDialog>
  );
}