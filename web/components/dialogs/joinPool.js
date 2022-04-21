import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import { useState } from "react";
import { toEthString } from "/services/formatter";
import { joinPool } from "/services/contract/pools";
import { usdc } from "../../services/formatter";

export default function JoinPoolDialog(props) {
  const {
    open,
    setOpen,
    loginCallback,
    address,
    handleSuccess,
    handleError,
    price,
    totalSupply,
    minimumInvest,
  } = props;
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setAmount("");
    setOpen(false);
    setLoading(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    joinPool(address, amount)
      .then((res) => {
        handleSuccess(`Joined Pool with ${amount} USD`);
        loginCallback();
        handleClose();
      })
      .catch((err) => {
        handleError(err);
        setLoading(false);
      });
  };

  const receivedTokens = ethers.BigNumber.from(usdc(amount)).div(price);
  const shareOfPool = receivedTokens
    .mul(100)
    .div(totalSupply.add(receivedTokens));

  const handleInput = (e) => {
    setAmount(e.target.value);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Join the Pool</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You will receive Governance Tokens proportionally to your invest
        </DialogContentText>
        <DialogContentText>
          Price per Governance Token: {toEthString(price, 6)} USD
        </DialogContentText>
        <TextField
          autoFocus
          type="number"
          margin="dense"
          value={amount}
          onChange={handleInput}
          label="Invest Amount"
          placeholder="1"
          fullWidth
          inputProps={{ min: "0" }}
          InputProps={{
            endAdornment: <InputAdornment position="end">USD</InputAdornment>,
          }}
        />
        <DialogContentText>
          Governance Tokens: {receivedTokens.toString()}
        </DialogContentText>
        <DialogContentText>
          Share of Pool: {shareOfPool.toString()}%
        </DialogContentText>
      </DialogContent>
      {loading ? (
        <Stack spacing={2} sx={{ textAlign: "center" }}>
          <Typography variant="subtitle1">Joining Pool...</Typography>
          <LinearProgress />
        </Stack>
      ) : (
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            color="success"
            disabled={minimumInvest.gt(usdc(amount))}
          >
            Join
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
