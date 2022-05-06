import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { createPool } from '/services/contract/pools';

export default function NewPoolDialog(props) {
  const { open, setOpen, fetchPools, handleSuccess, handleError, user } = props;
  const [poolName, setPoolName] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [entryBarrier, setEntryBarrier] = useState('');
  const [value, setValue] = useState('');
  const [waitingForPool, setWaitingForPool] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const handleClose = () => {
    setPoolName('');
    setTokenName('');
    setTokenSymbol('');
    setEntryBarrier('');
    setValue('');
    setWaitingForPool(false);
    setOpen(false);
    setShowMoreOptions(false);
    setLoading(false);
  };

  const checkIfInputEnough = () => {
    if (value < 3) setDisableButton(true);
    else setDisableButton(false);
  };

  const validateInput = (input) => {
    console.log(input);
    if (input >= 3) setValue(input);
  };

  const handleSubmit = () => {
    setLoading(true);
    setWaitingForPool(true);
    createPool(
      poolName,
      entryBarrier || value,
      tokenName || `${poolName} Token`,
      tokenSymbol || 'PGT',
      value
    )
      .then((res) => {
        console.log(res);
        handleSuccess(`Created Pool "${poolName}"`);
        handleClose();
        fetchPools();
      })
      .catch((err) => {
        handleError(err);
        setWaitingForPool(false);
      });
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>New WunderPool</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>
            Create a new WunderPool to Invest with your friends
          </DialogContentText>
          <TextField
            autoFocus
            label="Pool Name"
            placeholder="CryptoApes"
            fullWidth
            value={poolName}
            onChange={(e) => setPoolName(e.target.value)}
          />
          <TextField
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            //onChange={(e) => validateInput(e.target.value)}
            label="Your Invest"
            placeholder="1"
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">USD</InputAdornment>,
            }}
          />
          <div></div>
          <Collapse in={!showMoreOptions} sx={{ marginTop: '0px !important' }}>
            <Button
              onClick={() => setShowMoreOptions(true)}
              sx={{ marginTop: 1 }}
            >
              More Options
            </Button>
            {value < 3 && (
              <div className="text-red-600">
                "Your Invest" must atleast be $3.00!
              </div>
            )}
            {poolName.length < 3 && (
              <div className="text-red-600">
                "Pool name" must atleast be 3 letters!
              </div>
            )}
          </Collapse>
          <Collapse in={showMoreOptions}>
            <Stack spacing={2}>
              <Divider />
              <Grid container gap={{ xs: 2, sm: 0 }}>
                <Grid item xs={12} sm={9} pr={{ xs: 0, sm: 2 }}>
                  <TextField
                    label="Governance Token"
                    placeholder={`${poolName}Token`}
                    fullWidth
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Symbol"
                    placeholder="TKN"
                    fullWidth
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                  />
                </Grid>
              </Grid>
              <TextField
                type="number"
                value={entryBarrier}
                onChange={(e) => setEntryBarrier(e.target.value)}
                label="Minimum Invest"
                placeholder="1"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">USD</InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Collapse>
        </Stack>
      </DialogContent>
      {waitingForPool ? (
        <Stack spacing={2} sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1">Creating your Pool...</Typography>
          <LinearProgress />
        </Stack>
      ) : (
        <DialogActions>
          <button className="btn btn-danger" onClick={handleClose}>
            Cancel
          </button>
          <button
            className=" btn btn-success"
            onClick={handleSubmit}
            color="success"
            disabled={poolName.length < 3 || value < 3}
          >
            Create
          </button>
        </DialogActions>
      )}
      {loading && (
        <iframe
          className="w-auto"
          id="fr"
          name="transactionFrame"
          height="600"
        ></iframe>
      )}
    </Dialog>
  );
}
