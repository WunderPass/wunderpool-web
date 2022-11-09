import { Stack, Typography, DialogActions, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { registerParticipant } from '/services/contract/betting/games';
import ResponsiveDialog from '/components/general/utils/responsiveDialog';
import TransactionFrame from '/components/general/utils/transactionFrame';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '/services/shareLink';
import { approve } from '/services/contract/token';
import { distributorAddress } from '/services/contract/betting/init';

export default function PlaceBetDialog({
  open,
  game,
  user,
  wunderPool,
  handleSuccess,
  handleError,
  handleOpenBetNow,
}) {
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');

  const handleClose = () => {
    setLoading(false);
    setApproved(false);
    setGuessOne('');
    setGuessTwo('');
    handleOpenBetNow(true);
  };

  const handleApprove = () => {
    setLoading(true);
    approve(
      user.address,
      distributorAddress(game.version),
      game.stake,
      game.tokenAddress
    )
      .then((res) => {
        setApproved(true);
      })
      .catch(handleError)
      .then(() => setLoading(false));
  };

  const handleCreate = () => {
    setLoading(true);
    registerParticipant(
      game.id,
      [Number(guessOne), Number(guessTwo)],
      user.address,
      user.wunderId || wunderPool.resolveMember(user.address),
      game.version
    )
      .then((res) => {
        handleSuccess(`Placed Bet on ${game.event.name}`);
        handleClose();
        wunderPool.determineBettingCompetitions();
      })
      .catch(handleError)
      .then(() => setLoading(false));
  };

  useEffect(() => {
    setApproved(
      (wunderPool?.version?.number || 0) > 6 && game.version != 'ALPHA'
    );
  }, [wunderPool?.version?.number, game.version]);

  return (
    <ResponsiveDialog
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      title="Place Your Bet"
      actionButtons={
        <IconButton
          onClick={() =>
            handleShare(location.href, `Look at this Bet: `, handleSuccess)
          }
        >
          <ShareIcon className="text-casama-blue" />
        </IconButton>
      }
      actions={
        !loading && (
          <DialogActions className="flex items-center justify-center mx-4">
            <div className="flex flex-col items-center justify-center w-full">
              <button className="btn-neutral w-full py-3" onClick={handleClose}>
                Cancel
              </button>
              {approved ? (
                <button
                  className="btn-casama w-full py-3 mt-2"
                  onClick={handleCreate}
                  disabled={loading || !guessOne || !guessTwo}
                >
                  Bet
                </button>
              ) : (
                <button
                  className="btn-casama w-full py-3 mt-2"
                  onClick={handleApprove}
                  disabled={loading || !guessOne || !guessTwo}
                >
                  Approve
                </button>
              )}
            </div>
          </DialogActions>
        )
      }
    >
      {loading ? (
        <div className="px-6 pb-1">
          <Typography className="text-md text-center" color="GrayText">
            {approved ? 'Placing Bet...' : 'Approving...'}
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
          <Typography>{game.event.teamHome?.name}</Typography>
          <div className="w-12">
            <input
              inputMode="numeric"
              className="textfield text-center py-1 px-3"
              value={guessOne}
              onChange={(e) => setGuessOne(e.target.value)}
            />
          </div>
          <Typography>:</Typography>
          <div className="w-12">
            <input
              inputMode="numeric"
              className="textfield text-center py-1 px-3"
              value={guessTwo}
              onChange={(e) => setGuessTwo(e.target.value)}
            />
          </div>
          <Typography>{game.event.teamAway?.name}</Typography>
        </Stack>
      )}
      <TransactionFrame open={loading} />
    </ResponsiveDialog>
  );
}
