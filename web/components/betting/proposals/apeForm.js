import {
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import TokenInput from '/components/investing/tokens/input';
import { currency, round } from '/services/formatter';
import TransactionDialog from '/components/general/utils/transactionDialog';

export default function ApeForm(props) {
  const { setApe, wunderPool, handleSuccess, handleError } = props;
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenName, setTokenName] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState(null);
  const [tokenImage, setTokenImage] = useState(null);
  const [tokenPrice, setTokenPrice] = useState(false);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const receivedTokens = useMemo(
    () => (value && tokenPrice ? value / tokenPrice : null),
    [value, tokenPrice, tokenAddress]
  );

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
        `Let's buy ${tokenName} (${tokenSymbol})`,
        `We will invest $${value} into ${tokenName}`,
        value
      )
      .then((res) => {
        handleSuccess(`Created Proposal to buy ${tokenSymbol}`);
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
          <Typography variant="h5">Buy</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <TokenInput
          setTokenAddress={setTokenAddress}
          setTokenName={setTokenName}
          setTokenSymbol={setTokenSymbol}
          setTokenImage={setTokenImage}
          setTokenPrice={setTokenPrice}
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
                {tokenPrice && currency(tokenPrice)}
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
              {receivedTokens && (
                <Typography variant="subtitle1" textAlign="right">
                  {round(receivedTokens, receivedTokens > 1 ? 2 : 5)}{' '}
                  {tokenSymbol}
                </Typography>
              )}
            </FormControl>
          </Stack>
        </Collapse>
        {loading ? (
          <>
            <button className="btn btn-default" disabled variant="contained">
              Submitting Proposal...
            </button>
            <TransactionDialog open={open} onClose={handleClose} />
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
