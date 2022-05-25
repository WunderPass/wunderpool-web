import {
  Dialog,
  DialogContent,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { usdc } from '/services/formatter';
import { createNftBuyProposal } from '/services/contract/proposals';

export default function NftDialog(props) {
  const {
    open,
    setOpen,
    name,
    description,
    address,
    tokenId,
    imageUrl,
    poolAddress,
    user,
    fetchProposals,
    handleSuccess,
    handleError,
  } = props;
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setAmount('');
    setOpen(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    createNftBuyProposal(
      poolAddress,
      address,
      tokenId,
      user.address,
      `We will sell the NFT "${name}" to ${user.wunderId} for ${amount} USD`,
      `NFT Contract Address: ${address} // TokenID: ${tokenId}`,
      usdc(amount)
    )
      .then((res) => {
        console.log(res);
        handleSuccess(`Created Proposal to Buy NFT ${name}`);
        fetchProposals();
        handleClose();
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogContent>
        <Stack spacing={2}>
          <Stack
            spacing={2}
            alignItems="center"
            justifyContent="start"
            direction={{ xs: 'column', sm: 'row' }}
          >
            <img
              src={imageUrl}
              alt=""
              width="100%"
              height="auto"
              style={{ maxWidth: 250 }}
            />
            <Stack spacing={2}>
              <Typography variant="h5">{name}</Typography>
              <Typography variant="subtitle1">{description}</Typography>
            </Stack>
          </Stack>
          <Typography variant="subtitle1" textAlign="center">
            Make an Offer to buy the NFT from the Pool
          </Typography>
          <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
            <TextField
              autoFocus
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              label="Buy Amount"
              placeholder="1"
              inputProps={{ min: '0' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">USD</InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <button
              className="btn btn-default"
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Wating...' : 'Make an Offer'}
            </button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
