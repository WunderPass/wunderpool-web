import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  Switch,
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { createPool } from '/services/contract/pools';
import { BsImage } from 'react-icons/bs';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { BiUpload } from 'react-icons/bi';
import CurrencyInput from 'react-currency-input-field';
import { MdContentCopy } from 'react-icons/md';
import { BsLink45Deg } from 'react-icons/bs';
import { waitForTransaction } from '../../services/contract/provider';
import { getPoolAddressFromTx } from '../../services/contract/pools';
import { useRouter } from 'next/router';

export default function NewPoolDialog(props) {
  const {
    open,
    setOpen,
    fetchPools,
    handleSuccess,
    handleInfo,
    handleError,
    user,
  } = props;
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
  const [maxInvest, setMaxInvest] = useState('');
  const [maxInvestTouched, setMaxInvestTouched] = useState(false);
  const [maxMembers, setMaxMembers] = useState('50');
  const [value, setValue] = useState('');
  const [valueAsDollarString, setValueAsDollarString] = useState('');
  const [valueTouched, setValueTouched] = useState(false);
  const [waitingForPool, setWaitingForPool] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasEnoughBalance, setHasEnoughBalance] = useState(false);
  const [step, setStep] = useState(1);
  const [votingsOn, setVotingsOn] = useState(true);
  const router = useRouter();
  const end = useRef(null);

  //DurationPicker
  const [sixHours, setSixHours] = useState(false);
  const [twentyFourHours, settwentyFourHours] = useState(true);
  const [threeDays, setThreeDays] = useState(false);
  const [showCustomDurationTextBox, setShowCustomDurationTextBox] =
    useState(false);

  const VotingDuration = {
    SIXHOURS: 1,
    TWENTYFOURHOURS: 2,
    THREEDAYS: 3,
    CUSTOM: 4,
  };
  Object.freeze(VotingDuration);

  const durationPickerForBackground = (duration) => {
    setSixHours(false);
    settwentyFourHours(false);
    setThreeDays(false);
    setShowCustomDurationTextBox(false);
    switch (duration) {
      case 1:
        setSixHours(true);
        break;
      case 2:
        settwentyFourHours(true);
        break;
      case 3:
        setThreeDays(true);
        break;
      case 4:
        setShowCustomDurationTextBox(true);
        break;
      default:
    }
  };

  //PercentPicker
  const [overFifty, setOverFifty] = useState(true);
  const [showCustomPercentTextBox, setShowCustomPercentTextBox] =
    useState(false);

  const percentPickerForBackground = (id) => {
    setOverFifty(false);
    setShowCustomPercentTextBox(false);

    switch (id) {
      case 1:
        setOverFifty(true);
        break;
      case 2:
        setShowCustomPercentTextBox(true);
        break;
      default:
    }
  };

  //VotersPicker
  const [onePerson, setOnePerson] = useState(false);
  const [twoPersons, setTwoPerson] = useState(false);
  const [customPerson, setCustomPerson] = useState(false);

  const votersPickerForBackground = (id) => {
    setOnePerson(false);
    setTwoPerson(false);
    setCustomPerson(false);

    switch (id) {
      case 1:
        setOnePerson(true);
        break;
      case 2:
        setTwoPerson(true);
        break;
      case 3:
        setCustomPerson(true);
        break;
      default:
    }
  };

  //main functions
  const onToggle = () => {
    setVotingsOn(!votingsOn);
  };

  const stepBack = () => {
    setStep(step - 1);
  };

  const stepContinue = () => {
    setStep(step + 1);
  };

  const openAdvanced = () => {
    setShowMoreOptions(true);
    setTimeout(() => {
      end.current.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  };

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
    setStep(1);

    //DurationPicker
    setSixHours(false);
    settwentyFourHours(true);
    setThreeDays(false);
    setShowCustomDurationTextBox(false);

    //PercentPicker
    setOverFifty(true);
    setShowCustomPercentTextBox(false);

    //VotersPicker
    setOnePerson(false);
    setTwoPerson(true);
    setCustomPerson(false);
  };

  const convertToRawValue = (value) => {
    return value.replace(/[^0-9.]/g, '');
  };

  const handleValueChange = (e) => {
    setHasEnoughBalance(
      user.usdBalance >= Number(convertToRawValue(e.target.value))
    );
    setValueAsDollarString(e.target.value);
    setValue(convertToRawValue(e.target.value));
    setValueTouched(true);
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

  const checkMinAndMax = () => {
    if (maxInvest.length === 0) {
      setMaxInvest(value);
    }
    if (entryBarrier.length === 0) {
      setEntryBarrier(value);
    }
  };

  const handleSubmit = () => {
    checkMinAndMax();
    setStep(step + 1);
    setLoading(true);
    setWaitingForPool(true);
    uploadToServer();
    createPool(
      poolName,
      entryBarrier,
      tokenName,
      tokenSymbol,
      value / 100,
      user.address
    )
      .then((res) => {
        console.log(res);
        handleClose();
        handleInfo('Waiting for Blockchain Transaction');
        waitForTransaction(res)
          .then((tx) => {
            handleSuccess(`Created Pool "${poolName}"`);
            getPoolAddressFromTx(res)
              .then(({ address, name }) => {
                router.push(`/pools/${address}?name=${name}`);
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
            handleError('Pool Creation failed');
          });
        fetchPools();
      })
      .catch((err) => {
        handleError(err);
        setWaitingForPool(false);
      });
  };

  return (
    <Dialog
      className="flex rounded-2xl w-full justify-center"
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: { borderRadius: 12 },
      }}
    >
      {step < 2 && (
        <>
          <DialogTitle className="font-bold font-graphik tracking-tight w-full">
            Create a pool
          </DialogTitle>
          <DialogContent style={{ scrollbarwidth: 'none' }}>
            <Stack spacing={1}>
              <DialogContentText className="text-sm mb-7 font-graphik ">
                Step 1 of 3 | Pool Details
              </DialogContentText>

              <div>
                <label className="label" htmlFor="poolPicture">
                  Upload a profile picture for the Pool
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
              </div>

              <div>
                <label className="label" htmlFor="poolName">
                  Name of the Pool
                </label>
                <input
                  value={poolName}
                  onChange={handleNameChange}
                  className="textfield py-4 px-3 mt-2 "
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
                <label className="label pb-2" htmlFor="poolDescription">
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
                <label className="label pb-2" htmlFor="value">
                  Your Investment
                </label>
                <div>
                  <CurrencyInput
                    intlConfig={{ locale: 'en-US', currency: 'USD' }}
                    value={value}
                    className="textfield py-4 mt-2"
                    prefix={'$'}
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
                  {valueTouched && !hasEnoughBalance && (
                    <div className="text-red-600" style={{ marginTop: 0 }}>
                      You dont have that much USD in your wallet!
                    </div>
                  )}
                </div>
              </div>

              <Collapse className="" in={!showMoreOptions}>
                <button
                  className="text-black text-sm font-semibold mt-2"
                  onClick={openAdvanced}
                >
                  <div className="flex flex-row items-center text-lg">
                    Advanced Options
                    <MdOutlineKeyboardArrowDown className="ml-3 text-lg" />
                  </div>
                </button>
              </Collapse>
              <Collapse in={showMoreOptions}>
                <Stack spacing={2}>
                  <button
                    className="text-black text-sm font-semibold mt-2"
                    onClick={() => setShowMoreOptions(false)}
                  >
                    <div className="flex flex-row items-center text-lg">
                      Advanced Options
                      <MdOutlineKeyboardArrowUp className="ml-3 text-lg" />
                    </div>
                  </button>

                  <div>
                    <label className="label pb-2" htmlFor="value">
                      Minimum investment to join the Pool
                    </label>
                    <CurrencyInput
                      intlConfig={{ locale: 'en-US', currency: 'USD' }}
                      className="textfield py-4 mt-2"
                      prefix={'$'}
                      value={entryBarrier}
                      placeholder={valueAsDollarString}
                      type="text"
                      decimalsLimit={2}
                      onChange={(e) => {
                        setEntryBarrier(convertToRawValue(e.target.value));
                        setEntryBarrierTouched(e.target.value.length > 0);
                        console.log(convertToRawValue(e.target.value));
                        console.log(maxInvest);
                      }}
                    />
                    {entryBarrierTouched && entryBarrier < 3 && (
                      <div className="text-red-600" style={{ marginTop: 0 }}>
                        must be $3.00 or more
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label pb-2" htmlFor="value">
                      Maximum investment to join the Pool
                    </label>
                    <CurrencyInput //ADD FUNCTIONALITY
                      intlConfig={{ locale: 'en-US', currency: 'USD' }}
                      className="textfield py-4 mt-2"
                      prefix={'$'}
                      value={maxInvest}
                      placeholder={valueAsDollarString}
                      type="text"
                      decimalsLimit={2}
                      onChange={(e) => {
                        setMaxInvest(convertToRawValue(e.target.value));
                        setMaxInvestTouched(e.target.value.length > 0);
                      }}
                    />
                    {entryBarrierTouched && entryBarrier < 3 && (
                      <div className="text-red-600" style={{ marginTop: 0 }}>
                        must be $3.00 or more
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      className="label pb-2"
                      htmlFor="value" //ADD FUNCTIONALITY
                    >
                      Maximum members
                    </label>
                    <input
                      className="textfield py-4 mt-2"
                      id="maxMembers"
                      type="number"
                      placeholder="50"
                      value={maxMembers}
                      onChange={(e) => {
                        setMaxMembers(e.target.value);
                      }}
                    />
                  </div>

                  <div>
                    <label className="label pb-2" htmlFor="value">
                      Governance token
                    </label>
                    <input
                      className="textfield py-4 mt-2"
                      id="governance"
                      type="text"
                      placeholder={`${poolName}Token`}
                      value={tokenName}
                      onChange={(e) => {
                        setTokenName(e.target.value);
                        setTokenNameTouched(e.target.value.length > 0);
                      }}
                    />
                  </div>
                  <div>
                    <label className="label pb-2" htmlFor="value">
                      Token Symbol
                    </label>
                    <input
                      className="textfield py-4 mt-2"
                      id="governance"
                      type="text"
                      placeholder="TKN"
                      value={tokenSymbol}
                      onChange={(e) => {
                        setTokenSymbol(e.target.value);
                        setTokenSymbolTouched(e.target.value.length > 0);
                      }}
                    />
                  </div>

                  <div ref={end}></div>
                </Stack>
              </Collapse>
            </Stack>
          </DialogContent>
          {waitingForPool ? (
            <Stack spacing={2} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1">Creating your Pool...</Typography>
            </Stack>
          ) : (
            <DialogActions className="flex items-center justify-center mx-4">
              <div className="flex flex-col items-center justify-center w-full">
                <button
                  className="btn-neutral w-full py-3"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  className="btn-kaico w-full py-3 mt-2"
                  onClick={stepContinue}
                  disabled={poolName.length < 3 || value < 3}
                >
                  Continue
                </button>
              </div>
            </DialogActions>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <DialogTitle className="flex font-bold font-graphik tracking-tight w-full">
            Create a pool
          </DialogTitle>
          <DialogContent style={{ scrollbarwidth: 'none' }}>
            <Stack spacing={1}>
              <DialogContentText className="text-sm mb-7 font-graphik w-full">
                Step 2 of 3 | Voting Rules
              </DialogContentText>

              <div className="flex flex-row justify-between  items-center pb-4">
                <Typography className="text-xl">Votings</Typography>
                <Switch onClick={onToggle} defaultChecked />
              </div>

              <div className={votingsOn ? '' : 'opacity-20'}>
                <div className="pb-4 w-full">
                  <label className="label pb-1" htmlFor="value">
                    Duration of voting
                  </label>
                  <div className="flex flex-row textfield py-2 justify-between mt-2">
                    <button
                      id="b1"
                      className={
                        sixHours
                          ? 'bg-gray-200 text-black text-sm py-2 px-2 rounded-lg w-full'
                          : 'text-black text-sm py-2 px-2 rounded-lg w-full'
                      }
                      onClick={() =>
                        durationPickerForBackground(VotingDuration.SIXHOURS)
                      }
                    >
                      6h
                    </button>
                    <button
                      className={
                        twentyFourHours
                          ? 'bg-gray-200 text-black text-sm py-2 px-2 rounded-lg w-full'
                          : 'text-black text-sm py-2 px-2 rounded-lg w-full'
                      }
                      onClick={() =>
                        durationPickerForBackground(
                          VotingDuration.TWENTYFOURHOURS
                        )
                      }
                    >
                      24h
                    </button>
                    <button
                      className={
                        threeDays
                          ? 'bg-gray-200 text-black text-sm py-2 px-2 rounded-lg w-full'
                          : 'text-black text-sm py-2 px-2 rounded-lg w-full'
                      }
                      onClick={() =>
                        durationPickerForBackground(VotingDuration.THREEDAYS)
                      }
                    >
                      3d
                    </button>
                    <button
                      className={
                        showCustomDurationTextBox
                          ? 'hidden'
                          : 'text-black text-sm py-2 px-2 rounded-lg w-full'
                      }
                      onClick={() =>
                        durationPickerForBackground(VotingDuration.CUSTOM)
                      }
                    >
                      Custom
                    </button>
                    <input
                      className={
                        showCustomDurationTextBox
                          ? 'bg-gray-200 text-black text-sm px-2 rounded-lg w-full py-2 text-center'
                          : 'hidden'
                      }
                      type="text"
                      placeholder="in hours.."
                      onChange={(e) => {}}
                    />
                  </div>
                </div>

                <div className="pb-4">
                  <label className="label pb-1 sm:mr-52" htmlFor="value">
                    How many % is needed to win a vote
                  </label>
                  <div className="flex flex-row textfield py-2 justify-between mt-2">
                    <div className="flex items-center justify-center  w-full">
                      <button
                        className={
                          overFifty
                            ? 'bg-gray-200 text-black text-sm py-2 px-2 rounded-lg w-full'
                            : 'text-black text-sm py-2 px-2 rounded-lg w-full'
                        }
                        onClick={() => percentPickerForBackground(1)}
                      >
                        {'> 50%'}
                      </button>
                    </div>
                    <div className="flex w-full items-center justify-center">
                      <button
                        className={
                          showCustomPercentTextBox
                            ? 'hidden'
                            : 'text-black text-sm py-2 px-2 rounded-lg w-full'
                        }
                        onClick={() => {
                          percentPickerForBackground(2);
                        }}
                      >
                        Custom
                      </button>
                      <input
                        className={
                          showCustomPercentTextBox
                            ? 'bg-gray-200 text-black text-sm px-2 rounded-lg w-full py-2 text-center'
                            : 'hidden'
                        }
                        type="text"
                        placeholder=" in %.."
                        onChange={(e) => {}}
                      />
                    </div>
                  </div>
                </div>
                <div className="pb-4">
                  <label className="label pb-1 sm:mr-52" htmlFor="value">
                    How many people have to vote atleast
                  </label>
                  <div className="flex flex-row textfield py-2 justify-between mt-2">
                    <div className="flex items-center justify-center  w-full">
                      <button
                        className={
                          onePerson
                            ? 'bg-gray-200 text-black text-sm py-2 px-2 rounded-lg w-full'
                            : 'text-black text-sm py-2 px-2 rounded-lg w-full'
                        }
                        onClick={() => votersPickerForBackground(1)}
                      >
                        1
                      </button>
                    </div>
                    <div className="flex items-center justify-center  w-full">
                      <button
                        className={
                          twoPersons
                            ? 'bg-gray-200 text-black text-sm py-2 px-2 rounded-lg w-full'
                            : 'text-black text-sm py-2 px-2 rounded-lg w-full'
                        }
                        onClick={() => votersPickerForBackground(2)}
                      >
                        2
                      </button>
                    </div>
                    <div className="flex w-full items-center justify-center">
                      <button
                        className={
                          customPerson
                            ? 'hidden'
                            : 'text-black text-sm py-2 px-2 rounded-lg w-full'
                        }
                        onClick={() => {
                          votersPickerForBackground(3);
                        }}
                      >
                        Custom
                      </button>
                      <input
                        className={
                          customPerson
                            ? 'bg-gray-200 text-black text-sm px-2 rounded-lg w-full py-2 text-center'
                            : 'hidden'
                        }
                        type="text"
                        placeholder=" in persons.."
                        onChange={(e) => {}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Stack>
          </DialogContent>
          <DialogActions className="flex items-center justify-center mx-4">
            <div className="flex flex-col items-center justify-center w-full">
              <button className="btn-neutral w-full py-3" onClick={stepBack}>
                Back
              </button>
              <button
                className="btn-kaico w-full py-3 mt-2"
                onClick={stepContinue}
                disabled={poolName.length < 3 || value < 3}
              >
                Continue
              </button>
            </div>
          </DialogActions>
        </>
      )}

      {step === 3 && (
        <>
          <DialogTitle className="flex font-bold font-graphik tracking-tight w-full">
            Create a pool
          </DialogTitle>
          <DialogContent style={{ scrollbarwidth: 'none' }}>
            <Stack spacing={1}>
              <DialogContentText className="text-sm mb-7 font-graphik">
                Step 3 of 3 | Invite members
              </DialogContentText>

              <div>
                <label className="label pr-52" htmlFor="poolName">
                  Invite your friends via Wunderpass
                </label>
                <div className="flex flex-row justify-between textfield mb-6 mt-2">
                  <input
                    className=" w-full  text-gray-700 leading-tight rounded-lg bg-[#F6F6F6]  focus:outline-none"
                    id="inviteFriends"
                    type="text"
                    placeholder="m-muster"
                  />
                  <button className="btn-kaico my-3 p-2 px-6">
                    Invite Friends
                  </button>
                </div>
              </div>

              <Divider className="" />

              <div className="flex justify-between items-center pt-4">
                <label className="label  " htmlFor="value">
                  <div className="flex flex-row justify-between items-center">
                    <BsLink45Deg className="text-xl opacity-60 mr-1" />
                    <Typography>Invite by link</Typography>
                  </div>
                </label>
                <button className="btn-neutral bg-[#F6F6F6] sm:w-2/5 py-3">
                  <div className="flex flex-row justify-between items-center ">
                    <MdContentCopy className="text-gray-500 mr-2 ml-3" />
                    <Typography className="mr-3">Copy Link</Typography>
                  </div>
                </button>
              </div>
            </Stack>
          </DialogContent>
          <DialogActions className="flex items-center justify-center mx-4">
            <div className="flex flex-col items-center justify-center w-full">
              <button className="btn-neutral w-full py-3" onClick={stepBack}>
                Back
              </button>
              <button
                className="btn-kaico w-full py-3 mt-2"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </DialogActions>
        </>
      )}

      {loading && (
        <iframe
          className="w-auto"
          id="fr"
          name="transactionFrame"
          height="500"
        ></iframe>
      )}
    </Dialog>
  );
}
