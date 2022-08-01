import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { currency } from '/services/formatter';
import TransactionFrame from '/components/utils/transactionFrame';
import { formatTokenBalance } from '/services/formatter';

export default function DestroyPoolDialog(props) {
  const { open, setOpen, name, wunderPool, handleSuccess, handleError } = props;
  const [loading, setLoading] = useState(false);
  const [userShare, setUserShare] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    wunderPool
      .liquidateSuggestion(
        "Let's close this Pool",
        'This proposal will close the pool and split the remaining tokens and funds amongst all members.'
      )
      .then((res) => {
        handleSuccess(`Created new Proposal to close the pPool ${name}`);
        wunderPool.determineProposals();
      })
      .catch((err) => {
        setLoading(false);
      })
      .then(() => {
        handleClose();
      });
  };

  useEffect(() => {
    if (!wunderPool.governanceToken) return;
    setUserShare(wunderPool.userShare());
  }, [wunderPool.governanceToken]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: { borderRadius: 12 },
      }}
    >
      <DialogTitle>Close Pool</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography>
            This will transfer all Tokens and Funds from the Pool equally to all
            of its Members.
          </Typography>
        </DialogContentText>
        <Alert className="mb-1" severity="warning">
          This will create a Proposal to close the Pool
        </Alert>
        {wunderPool.tokens.filter((t) => t.balance > 0).length > 1 && (
          <Alert severity="error">
            Currently all tokens will be split amongst the members! If you only
            want to get USD please sell all tokens before closing the pool!
          </Alert>
        )}

        <Typography variant="h6" mt={1}>
          You will receive:
        </Typography>

        {userShare ? (
          <>
            {wunderPool.tokens
              .filter((tkn) => tkn.balance > 0)
              .map((tkn, i) => {
                const tokenValue = currency(
                  ethers.BigNumber.from(tkn.balance)
                    .mul(userShare)
                    .mul(tkn.price)
                    .div(100)
                    .div(10000)
                    .div(ethers.BigNumber.from(10).pow(tkn.decimals))
                    .toNumber() / 100
                );
                const tokenAmount = formatTokenBalance(
                  (tkn.formattedBalance * userShare) / 100
                );

                return (
                  <Stack
                    key={`tkn-prev-${i}`}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    py={1}
                    width="100%"
                    borderTop="1px solid lightgray"
                  >
                    <img width="40" src={tkn.image || '/favicon.ico'} alt="" />

                    <Typography sx={{ flexGrow: 1 }}>{tkn.name}</Typography>
                    <div className="flex justify-end items-center">
                      <Typography sx={{ flexGrow: 1 }}>
                        {tokenAmount}
                      </Typography>
                      <Typography className="ml-2" color="green">
                        ({tokenValue})
                      </Typography>
                    </div>
                  </Stack>
                );
              })}
          </>
        ) : (
          <Skeleton width="100%" height={10} />
        )}
      </DialogContent>
      {loading ? (
        <Stack spacing={2} sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1">Submitting Proposal</Typography>
        </Stack>
      ) : (
        <DialogActions>
          <button className="btn btn-default" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleSubmit}>
            Submit Proposal
          </button>
        </DialogActions>
      )}
      <TransactionFrame open={loading} />
    </Dialog>
  );
}
