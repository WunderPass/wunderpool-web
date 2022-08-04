import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Collapse,
} from '@mui/material';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import { useMemo, useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
import TokenInput from '../tokens/input';
import TransactionFrame from '../utils/transactionFrame';
import { currency, round, usdc, polyValueToUsd } from '/services/formatter';
import ResponsiveDialog from '../utils/responsiveDialog';

export default function makeProposal(props) {
  const { open, setOpen, wunderPool, handleSuccess, handleError } = props;
  const [tokenAddress, setTokenAddress] = useState('');
  const [proposalName, setProposalName] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenImage, setTokenImage] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenPrice, setTokenPrice] = useState(null);
  const [value, setValue] = useState('');
  const [valueTouched, setValueTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasEnoughBalance = useMemo(() => {
    if (!value) return true;
    return wunderPool.usdcBalance.gte(usdc(value));
  }, [value]);

  const receivedTokens = useMemo(
    () => (value && tokenPrice ? value / tokenPrice : null),
    [value, tokenPrice, tokenAddress]
  );

  const handleApe = (e) => {
    e.preventDefault();
    setLoading(true);
    wunderPool
      .apeSuggestion(
        tokenAddress,
        proposalName ||
          `Let's buy ${tokenName} (${tokenSymbol}) for ${currency(value)}`,
        proposalDescription || ``,
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

  const handleClose = () => {
    setOpen(false);
    setProposalName('');
    setProposalDescription('');
    setTokenAddress('');
    setTokenName('');
    setTokenSymbol('');
    setTokenImage(null);
    setValue('');
    setLoading(false);
  };

  const convertToRawValue = (value) => {
    return value.replace(/[^0-9.]/g, '');
  };

  const handleValueChange = (e) => {
    setValue(convertToRawValue(e.target.value));
    setValueTouched(true);
  };

  return (
    <ResponsiveDialog
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      title="Make a Proposal"
      disablePadding={loading}
      actions={
        !loading && (
          <DialogActions className="flex items-center justify-center mx-4">
            <div className="flex flex-col items-center justify-center w-full">
              <button className="btn-neutral w-full py-3" onClick={handleClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-kaico w-full py-3 mt-2"
                onClick={handleApe}
                disabled={!tokenName || !tokenSymbol || value == 0}
              >
                Continue
              </button>
            </div>
          </DialogActions>
        )
      }
    >
      {loading ? (
        <div className="px-6 pb-1">
          <Typography className="text-md text-center" color="GrayText">
            {proposalName}
          </Typography>
          <div className="flex flex-row justify-between items-center gap-1 w-full">
            <Typography className="text-md" color="GrayText">
              {currency(value)}
            </Typography>
            <DoubleArrowIcon />
            <img className="w-9" src={tokenImage || '/favicon.ico'} />
          </div>
        </div>
      ) : (
        <>
          <Stack spacing={1}>
            <div className="mt-2 mb-2">
              <label className="label" htmlFor="proposalName">
                Title
              </label>
              <input
                className="textfield py-4 px-3 mt-2 "
                id="proposalName"
                type="text"
                placeholder="Title (optional) "
                onChange={(e) => {
                  setProposalName(e.target.value);
                }}
              />
            </div>
            <div className="">
              <label className="label" htmlFor="proposalDescription">
                Description
              </label>
              <input
                className="textfield py-4 px-3 mt-2 "
                id="proposalDescription"
                type="text"
                placeholder="Description (optional) "
                onChange={(e) => {
                  setProposalDescription(e.target.value);
                }}
              />
            </div>

            <div className="pt-4">
              <label className="label pb-2" htmlFor="poolDescription">
                Buy Token
              </label>

              <div className="mt-2">
                <TokenInput
                  className="textfield py-4 pb-9 mt-2"
                  setTokenAddress={setTokenAddress}
                  setTokenName={setTokenName}
                  setTokenSymbol={setTokenSymbol}
                  setTokenImage={setTokenImage}
                  setTokenPrice={setTokenPrice}
                />
              </div>
            </div>
            <Collapse in={tokenName && tokenSymbol ? true : false}>
              <div className="flex flex-row justify-between items-center pr-2 gap-1">
                <img className="w-9" src={tokenImage || '/favicon.ico'} />
                <Typography className="text-md flex-grow">
                  {tokenName}
                </Typography>
                <Typography className="text-md" color="GrayText">
                  {currency(tokenPrice)}
                </Typography>
              </div>
            </Collapse>

            <div className="pt-2">
              <label className="label pb-2" htmlFor="value">
                Amount
              </label>
              <div>
                <CurrencyInput
                  intlConfig={{ locale: 'en-US', currency: 'USD' }}
                  className="textfield py-4 mt-2"
                  prefix={'$'}
                  placeholder="$1.00"
                  decimalsLimit={2}
                  type="text"
                  value={value}
                  onChange={handleValueChange}
                  label="amount"
                />
                {receivedTokens && (
                  <Typography variant="subtitle1" textAlign="right">
                    {round(receivedTokens, receivedTokens > 1 ? 2 : 5)}{' '}
                    {tokenSymbol}
                  </Typography>
                )}

                {valueTouched && !hasEnoughBalance && (
                  <div className="text-red-600" style={{ marginTop: 0 }}>
                    {`The pool only has ${currency(
                      polyValueToUsd(wunderPool.usdcBalance.toString())
                    )} in its Treasury!`}
                  </div>
                )}
              </div>
            </div>
          </Stack>
        </>
      )}
      <TransactionFrame open={loading} />
    </ResponsiveDialog>
  );
}
