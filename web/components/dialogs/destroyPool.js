import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { currency } from '../../services/formatter';

export default function DestroyPoolDialog(props) {
  const { open, setOpen, name, wunderPool, handleSuccess, handleError } = props;
  const [loading, setLoading] = useState(false);
  const [userShare, setUserShare] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setLoading(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    wunderPool
      .liquidateSuggestion("Let's Liquidate the Pool", 'I want my money back')
      .then((res) => {
        console.log(res);
        handleSuccess(`Created new Proposal to Liquidate the Pool ${name}`);
        wunderPool.determineProposals();
        handleClose();
      })
      .catch((err) => {
        handleError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!wunderPool.governanceToken) return;
    setUserShare(wunderPool.userShare());
  }, [wunderPool.governanceToken]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: { borderRadius: 12 },
      }}
    >
      <DialogTitle>Liquidate Pool</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will transfer all Funds from the Pool equally to all of its
          Members.
        </DialogContentText>
        <Alert severity="warning">
          This will create a Proposal to Liquidate the Pool
        </Alert>
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
                    .toNumber() / 100,
                  {}
                );
                return (
                  <Stack
                    key={`tkn-prev-${i}`}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    pt={1}
                    width="100%"
                    borderTop="1px solid lightgray"
                  >
                    <img width="40" src={tkn.image || '/favicon.ico'} alt="" />
                    <Typography sx={{ flexGrow: 1 }}>{tkn.name}</Typography>
                    <Typography color="green">+ {tokenValue}</Typography>
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
      {loading && (
        <iframe
          className="w-auto"
          id="fr"
          name="transactionFrame"
          height="500"
        ></iframe>
      )}
    </Dialog>
  );
}
