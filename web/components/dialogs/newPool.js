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
import { useState, useEffect } from 'react';
import { createPool } from '/services/contract/pools';
import { BsImage } from 'react-icons/bs';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { BiUpload } from 'react-icons/bi';
import CurrencyInput from 'react-currency-input-field';

export default function NewPoolDialog(props) {
  const { open, setOpen, fetchPools, handleSuccess, handleError, user } = props;
  const [poolName, setPoolName] = useState('');
  const [poolDescription, setPoolDescription] = useState('');
  const [image, setImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);
  const [poolNameTouched, setPoolNameTouched] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [tokenNameTouched, setTokenNameTouched] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenSymbolTouched, setTokenSymbolTouched] = useState(false);
  const [entryBarrier, setEntryBarrier] = useState('');
  const [entryBarrierTouched, setEntryBarrierTouched] = useState(false);
  const [value, setValue] = useState('');
  const [valueTouched, setValueTouched] = useState(false);
  const [waitingForPool, setWaitingForPool] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasEnoughBalance, setHasEnoughBalance] = useState(false);

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setImage(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  const uploadToServer = async (event) => {
    const body = new FormData();
    body.append('file', image);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body,
    });
  };

  useEffect(() => {
    setHasEnoughBalance(user.usdBalance >= value);
    console.log('3');
  });

  const handleClose = () => {
    setPoolDescription('');
    setPoolName('');
    setTokenName('');
    setTokenSymbol('');
    setEntryBarrier('');
    setValue('');
    setCreateObjectURL('');
    setImage('');
    setValueTouched(false);
    setPoolNameTouched(false);
    setTokenNameTouched(false);
    setTokenSymbolTouched(false);
    setEntryBarrierTouched(false);
    setWaitingForPool(false);
    setOpen(false);
    setShowMoreOptions(false);
    setLoading(false);
  };

  const convertToRawValue = (value) => {
    return value.replace(/[^0-9,]/g, '');
  };

  const handleValueChange = (e) => {
    setValue(convertToRawValue(e.target.value));
    console.log('1');
    setValueTouched(true);
    console.log('2');
  };

  const handleNameChange = (e) => {
    let name = e.target.value;
    setPoolName(name);
    setPoolNameTouched(true);
    if (!tokenNameTouched)
      setTokenName(
        `${name.trim()}${
          name.match(' ') ? ' ' : name.match('-') ? '-' : ''
        }Token`
      );
    if (!tokenSymbolTouched)
      setTokenSymbol(name.slice(0, 3).toUpperCase() || 'PGT');
  };

  const handleDescriptionChange = (e) => {
    let description = e.target.value;
    setPoolDescription(description);
  };

  const handleSubmit = () => {
    setLoading(true);
    setWaitingForPool(true);
    uploadToServer();
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
    <Dialog
      className="rounded-2xl"
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: { borderRadius: 12 },
      }}
    >
      <DialogTitle className="font-bold">Create a pool</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <DialogContentText className="text-sm mb-7">
            Step 1 of 3 | Pool Details
          </DialogContentText>

          <div>
            <label className="label" for="poolPicture">
              Upload a profile picture of the Pool
            </label>
            <label htmlFor="fileUpload">
              <div
                className={
                  createObjectURL
                    ? 'flex items-center justify-center border-dotted border-2 border-gray-400 w-28 h-28 mt-2 mb-2 cursor-pointer'
                    : 'flex items-center justify-center border-dotted rounded-xl border-2 border-gray-300 w-28 h-28 mt-2 mb-2 cursor-pointer'
                }
                type="file"
                name="poolPicture"
              >
                {createObjectURL ? (
                  <img className="w-full" src={createObjectURL} />
                ) : (
                  <BsImage className="text-kaico-light-blue text-4xl" />
                )}
              </div>
            </label>

            <input
              className="hidden"
              id="fileUpload"
              type="file"
              name="myImage"
              accept="image/*"
              onChange={uploadToClient}
            />
            <button onClick={uploadToServer}>CLICK</button>
          </div>

          <div>
            <label class="block text-sm font-semibold" for="poolName">
              Name of the Pool
            </label>
            <input
              value={poolName}
              onChange={handleNameChange}
              className="textfield py-4 px-3 mt-2"
              id="poolName"
              type="text"
              placeholder="Name of the Pool"
            />

            {poolNameTouched && poolName.length < 3 && (
              <div className="text-red-600" style={{ marginTop: 0 }}>
                must be 3 letters or more
              </div>
            )}
          </div>

          <div>
            <label className="label pb-2" for="poolDescription">
              Description of the Pool
            </label>
            <input
              value={poolDescription}
              onChange={handleDescriptionChange}
              className="textfield py-4 pb-9 mt-2"
              id="poolDescription"
              type="text"
              placeholder="Description of the Pool"
            />
          </div>

          <div>
            <label className="label pb-2" for="value">
              Your Investment
            </label>
            <div>
              <CurrencyInput
                className="textfield py-4 mt-2"
                prefix={'$'}
                id="value"
                name="value"
                type="text"
                placeholder="min - $3,00"
                decimalsLimit={2}
                onChange={handleValueChange}
              />
              {valueTouched && value < 3 && (
                <div className="text-red-600" style={{ marginTop: 0 }}>
                  must be $3.00 or more
                </div>
              )}
              {!hasEnoughBalance && (
                <div className="text-red-600" style={{ marginTop: 0 }}>
                  You dont have that much USD in your wallet!
                </div>
              )}
            </div>
          </div>

          <Collapse className="" in={!showMoreOptions}>
            <button
              className="text-black text-sm font-semibold mt-2"
              onClick={() => setShowMoreOptions(true)}
            >
              <div className="flex flex-row items-center">
                Advanced Options
                <MdOutlineKeyboardArrowDown className="ml-3 text-md" />
              </div>
            </button>
          </Collapse>
          <Collapse in={showMoreOptions}>
            <Stack spacing={2}>
              <button
                className="text-black text-sm font-semibold mt-2"
                onClick={() => setShowMoreOptions(false)}
              >
                <div className="flex flex-row items-center">
                  Advanced Options
                  <MdOutlineKeyboardArrowUp className="ml-3 text-md" />
                </div>
              </button>

              <div>
                <label className="label pb-2" for="value">
                  Minimum investment to join the Pool
                </label>
                <CurrencyInput
                  className="textfield py-4 mt-2"
                  prefix={'$'}
                  id="entryBarrier"
                  name="entryBarrier"
                  placeholder="min - $3,00"
                  type="text"
                  decimalsLimit={2}
                  onChange={(e) => {
                    setEntryBarrier(convertToRawValue(e.target.value));
                    setEntryBarrierTouched(e.target.value.length > 0);
                  }}
                />
                {entryBarrierTouched && entryBarrier < 3 && (
                  <div className="text-red-600" style={{ marginTop: 0 }}>
                    must be $3.00 or more
                  </div>
                )}
              </div>

              <div>
                <label className="label pb-2" for="value">
                  Maximum members
                </label>
                <input
                  className="textfield py-4 mt-2"
                  id="maxMembers"
                  type="number"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="label pb-2" for="value">
                  Lifetime of the Pool
                </label>
                <div className="flex flex-row textfield py-2 justify-between mt-2">
                  <button className="focus:bg-white text-black font-semibold text-sm py-2 px-3 rounded-lg">
                    Infinite
                  </button>
                  <button className="focus:bg-white text-black font-semibold text-sm py-2 px-3 rounded-lg">
                    3 M
                  </button>
                  <button className="focus:bg-white text-black font-semibold text-sm py-2 px-3 rounded-lg">
                    1 Y
                  </button>
                  <button className="focus:bg-white text-black font-semibold text-sm py-2 px-3 rounded-lg">
                    Custom
                  </button>
                </div>
              </div>

              <div /* DISABLE CUSTOM GOVERNANCE TOKEN FOR NOW

              <Grid container gap={{ xs: 2, sm: 0 }}>
                <Grid item xs={12} sm={9} pr={{ xs: 0, sm: 2 }}>
                  <TextField
                    label="Governance Token"
                    placeholder={`${poolName}Token`}
                    fullWidth
                    value={tokenName}
                    onChange={(e) => {
                      setTokenName(e.target.value);
                      setTokenNameTouched(e.target.value.length > 0);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Symbol"
                    placeholder="TKN"
                    fullWidth
                    value={tokenSymbol}
                    onChange={(e) => {
                      setTokenSymbol(e.target.value);
                      setTokenSymbolTouched(e.target.value.length > 0);
                    }}
                  />
                </Grid>
              </Grid>
              <TextField
                type="number"
                value={entryBarrier}
                onChange={(e) => {
                  setEntryBarrier(e.target.value);
                  setEntryBarrierTouched(e.target.value.length > 0);
                }}
                label="Minimum Invest"
                placeholder="1"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">USD</InputAdornment>
                  ),
                }}
              />
              */
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
        <DialogActions className="flex items-center justify-center mx-4">
          <div className="flex flex-col items-center justify-center w-full">
            <button className="btn-cancel w-full py-3" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="btn-kaico w-full py-3 mt-2 font-semibold"
              onClick={handleSubmit}
              disabled={poolName.length < 3 || value < 3}
            >
              Continue
            </button>
          </div>
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
