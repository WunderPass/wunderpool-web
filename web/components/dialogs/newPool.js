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
} from "@mui/material";
import { useState } from "react";
import { createPool } from "/services/contract/pools";

export default function NewPoolDialog(props) {
  const { open, setOpen, fetchPools, handleSuccess, handleError, user } = props;
  const [poolName, setPoolName] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [entryBarrier, setEntryBarrier] = useState("");
  const [value, setValue] = useState("");
  const [waitingForPool, setWaitingForPool] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleClose = () => {
    setPoolName("");
    setTokenName("");
    setTokenSymbol("");
    setEntryBarrier("");
    setValue("");
    setWaitingForPool(false);
    setOpen(false);
    setShowMoreOptions(false);
  };

  const handleSubmit = () => {
    setWaitingForPool(true);
    createPool(
      poolName,
      entryBarrier || value,
      tokenName || `${poolName} Token`,
      tokenSymbol || "PGT",
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
            label="Your Invest"
            placeholder="1"
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">USD</InputAdornment>,
            }}
          />
          <Collapse in={!showMoreOptions} sx={{ marginTop: "0px !important" }}>
            <Button
              onClick={() => setShowMoreOptions(true)}
              sx={{ marginTop: 1 }}
            >
              More Options
            </Button>
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
        <Stack spacing={2} sx={{ textAlign: "center" }}>
          <Typography variant="subtitle1">Creating your Pool...</Typography>
          <LinearProgress />
        </Stack>
      ) : (
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            color="success"
            disabled={poolName.length < 3}
          >
            Create
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
