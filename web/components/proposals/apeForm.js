import {
  Dialog,
  Button,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  LinearProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import TokenInput from '../tokens/input';
import axios from 'axios';
import { currency, round } from '/services/formatter';

export default function ApeForm(props) {
  const { setApe, wunderPool, handleSuccess, handleError } = props;
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenName, setTokenName] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState(null);
  const [tokenImage, setTokenImage] = useState(null);
  const [tokenPrice, setTokenPrice] = useState(false);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [waitingForPrice, setWaitingForPrice] = useState(false);

  const receivedTokens = value / tokenPrice;

  const handleClose = () => {
    setTokenAddress('');
    setTokenName(null);
    setTokenSymbol(null);
    setTokenImage(null);
    setValue(0);
    setLoading(false);
    setApe(false);
  };

  const handleApe = (e) => {
    e.preventDefault();
    setLoading(true);
    wunderPool
      .apeSuggestion(
        tokenAddress,
        `Let's Ape into ${tokenName} (${tokenSymbol})`,
        `We will ape ${value} USD into ${tokenName}`,
        value
      )
      .then((res) => {
        handleSuccess(`Created Proposal to Ape into ${tokenSymbol}`);
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

  useEffect(() => {
    if (tokenAddress && tokenAddress.length == 42) {
      setWaitingForPrice(true);
      axios({
        url: `/api/tokens/price`,
        params: { address: tokenAddress },
      }).then((res) => {
        setTokenPrice(res.data?.dollar_price);
        setWaitingForPrice(false);
      });
    }
  }, [tokenAddress]);

  const handleValueInput = (e) => {
    setValue(e.target.value);
  };

  return (
    <form>
      <Stack width="100%" spacing={3}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5">APE</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <TokenInput
          setTokenAddress={setTokenAddress}
          setTokenName={setTokenName}
          setTokenSymbol={setTokenSymbol}
          setTokenImage={setTokenImage}
        />
        <Collapse in={tokenName && tokenSymbol ? true : false}>
          <Stack spacing={3}>
            <Stack
              spacing={2}
              alignItems="center"
              direction="row"
              sx={{ height: '50px' }}
            >
              <img width="50px" src={tokenImage || '/favicon.ico'} />
              <Typography variant="h4" flexGrow={1}>
                {tokenName}
              </Typography>
              <Typography variant="h4" color="GrayText">
                {!waitingForPrice && currency(tokenPrice, {})}
              </Typography>
            </Stack>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Ape Amount</InputLabel>
              <OutlinedInput
                type="number"
                value={value}
                onChange={handleValueInput}
                label="Ape Amount"
                placeholder="1"
                endAdornment={
                  <InputAdornment position="end">USD</InputAdornment>
                }
              />
              <Typography variant="subtitle1" textAlign="right">
                {round(receivedTokens, receivedTokens > 1 ? 2 : 5)}{' '}
                {tokenSymbol}
              </Typography>
            </FormControl>
          </Stack>
        </Collapse>
        {loading ? (
          <>
            <button className="btn btn-default" disabled variant="contained">
              Submitting Proposal...
            </button>
            <Dialog
              open={open}
              onClose={handleClose}
              PaperProps={{
                style: { borderRadius: 12 },
              }}
            >
              <iframe
                className="w-auto"
                id="fr"
                name="transactionFrame"
                height="500"
              ></iframe>
              <Stack spacing={2} sx={{ textAlign: 'center' }}></Stack>
            </Dialog>
          </>
        ) : (
          <button
            className="btn btn-success"
            type="submit"
            disabled={!tokenName || !tokenSymbol || value == 0}
            onClick={handleApe}
            variant="contained"
          >
            Create Token proposal
          </button>
        )}
      </Stack>
    </form>
  );
}
