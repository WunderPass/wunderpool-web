import {
  Dialog,
  DialogContent,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { usdc } from '../../services/formatter';

export default function SellNftDialog(props) {
  const { open, setOpen, wunderPool, user, handleSuccess, handleError } = props;
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setAmount('');
    setOpen(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    wunderPool
      .nftSellProposal(
        address,
        tokenId,
        `We will buy an NFT from ${user.wunderId} for ${amount} USD`,
        `NFT Contract Address: ${address} // TokenID: ${tokenId}`,
        usdc(amount)
      )
      .then((res) => {
        handleSuccess(`Created Proposal to Sell NFT`);
        wunderPool.determineProposals();
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
          <Typography variant="h6" textAlign="center">
            Make an Offer to sell your NFT to the Pool
          </Typography>
          <TextField
            autoFocus
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            label="NFT Contract Address"
            placeholder="0x4109DE064763d38D757a68265df9F84A09988b30"
          />
          <TextField
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            label="TokenId"
            placeholder="1"
            inputProps={{ min: '0' }}
          />
          <TextField
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            label="Sell Amount"
            placeholder="1"
            inputProps={{ min: '0' }}
            InputProps={{
              endAdornment: <InputAdornment position="end">USD</InputAdornment>,
            }}
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
      </DialogContent>
    </Dialog>
  );
}
