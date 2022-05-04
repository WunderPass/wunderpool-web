import {
  Alert,
  Button,
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
import { createLiquidateSuggestion } from '/services/contract/proposals';

export default function DestroyPoolDialog(props) {
  const {
    open,
    setOpen,
    address,
    name,
    fetchProposals,
    handleSuccess,
    handleError,
  } = props;
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setLoading(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    createLiquidateSuggestion(
      address,
      "Let's Liquidate the Pool",
      'I want my money back'
    )
      .then((res) => {
        console.log(res);
        handleSuccess(`Created new Proposal to Liquidate the Pool ${name}`);
        fetchProposals();
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
          <LinearProgress />
        </Stack>
      ) : (
        <DialogActions>
          <button className="btn-default btn-red" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn-default btn-green"
            onClick={handleSubmit}
            color="warning"
          >
            Submit Proposal
          </button>
        </DialogActions>
      )}
    </Dialog>
  );
}
