import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export default function DestroyPoolDialog(props) {
  const { open, setOpen, name, wunderPool, handleSuccess, handleError } = props;
  const [loading, setLoading] = useState(false);

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

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Liquidate Pool</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will transfer all Funds from the Pool equally to all of its
          Members.
        </DialogContentText>
        <Alert severity="warning">
          This will create a Proposal to Liquidate the Pool
        </Alert>
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
