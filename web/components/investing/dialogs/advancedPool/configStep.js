import { Collapse, DialogContentText, Stack, Switch } from '@mui/material';
import { useState } from 'react';
import { BsImage } from 'react-icons/bs';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';
import HintLabel from '/components/general/utils/hintLabel';
import CurrencyInput from '/components/general/utils/currencyInput';

export default function NewPoolConfigStep(props) {
  const {
    user,
    poolName,
    setPoolName,
    poolDescription,
    setPoolDescription,
    imageUrl,
    setImageUrl,
    setImage,
    value,
    setValue,
    valueErrorMsg,
    setValueErrorMsg,
    minInvest,
    setMinInvest,
    minInvestErrorMsg,
    setMinInvestErrorMsg,
    maxInvest,
    setMaxInvest,
    maxInvestErrorMsg,
    setMaxInvestErrorMsg,
    maxMembers,
    setMaxMembers,
    tokenName,
    setTokenName,
    tokenSymbol,
    setTokenSymbol,
    tokenNameTouched,
    setTokenNameTouched,
    tokenSymbolTouched,
    setTokenSymbolTouched,
    isPublic,
    setIsPublic,
    autoLiquidateTs,
    setAutoLiquidateTs,
    totalSteps,
  } = props;
  const [poolNameTouched, setPoolNameTouched] = useState(poolName.length > 0);

  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const valueAsDollarString = value ? `$ ${value}` : '$ 3.00';

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setImage(i);
      setImageUrl(URL.createObjectURL(i));
    }
  };

  const handleValueChange = (val, float) => {
    setValue(val);
    let msg = null;
    if (float < 3) msg = 'Your Invest must be at least $3.00';
    if (float > user.usdBalance) msg = 'Not enough USD';
    if (minInvest && float <= minInvest)
      msg = 'Your Invest must at least be the Minimum Invest';
    if (maxInvest && float >= maxInvest)
      msg = "Your Invest can't be larger than the Maximum Invest";
    setValueErrorMsg(msg);
  };

  const handleMinInvest = (val, float) => {
    setMinInvest(val);
    let msg = null;
    if (float < 3) msg = 'Minimum Invest must be at least $3.00';
    if (maxInvest && float > Number(maxInvest))
      msg = "Minimum Invest can't be larger than Maximum Invest";
    if (value && float > Number(value))
      msg = "Minimum Invest can't be larger than your Invest";
    setMinInvestErrorMsg(float ? msg : null);
  };

  const handleMaxInvest = (val, float) => {
    setMaxInvest(val);
    let msg = null;
    if (minInvest && float < Number(minInvest))
      msg = "Maximum Invest can't be less than Minimum Invest";
    if (value && float < Number(value))
      msg = "Maximum Invest can't be less than your Invest";
    setMaxInvestErrorMsg(float ? msg : null);
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
      setTokenSymbol(
        name.replaceAll(' ', '').slice(0, 3).toUpperCase() || 'PGT'
      );
  };

  return (
    <Stack spacing={1}>
      <DialogContentText className="text-sm mb-7 font-graphik ">
        Step 1 of {totalSteps} | Pool Details
      </DialogContentText>

      <div>
        <label className="label" htmlFor="poolPicture">
          Upload a profile picture for the Pool
        </label>
        <label htmlFor="fileUpload">
          <div
            className={`flex items-center justify-center border-dotted border-2 w-28 h-28 mt-2 mb-2 cursor-pointer  ${
              imageUrl ? 'border-gray-400' : 'border-gray-300 rounded-xl'
            }`}
            type="file"
            name="poolPicture"
          >
            {imageUrl ? (
              <img className="w-full" src={imageUrl} />
            ) : (
              <BsImage className="text-casama-light-blue text-4xl" />
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
          Name of the Pool *
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
          onChange={(e) => setPoolDescription(e.target.value)}
          className="textfield py-4 pb-9 mt-2"
          id="poolDescription"
          type="text"
          placeholder="Description of the Pool"
        />
      </div>

      <div>
        <label className="label pb-2" htmlFor="amount">
          Your Investment *
        </label>
        <span className="text-gray-500 text-xs ml-2">
          (Fee of 4.9% applies)
        </span>
        <div id="amount">
          <CurrencyInput
            value={value}
            placeholder="$ 50.00"
            onChange={handleValueChange}
            error={valueErrorMsg}
          />
        </div>
      </div>

      <button
        className="text-black text-sm font-medium mt-2"
        onClick={() => setShowMoreOptions((val) => !val)}
      >
        <div id="advanced" className="flex flex-row items-center text-lg">
          Advanced Options
          {showMoreOptions ? (
            <MdOutlineKeyboardArrowUp className="ml-3 text-lg" />
          ) : (
            <MdOutlineKeyboardArrowDown className="ml-3 text-lg" />
          )}
        </div>
      </button>
      <Collapse in={showMoreOptions}>
        <Stack spacing={2}>
          <div>
            <label className="label pb-2" htmlFor="minAmount">
              Minimum investment to join the Pool
            </label>
            <div id="minAmount">
              <CurrencyInput
                value={minInvest}
                placeholder={valueAsDollarString}
                onChange={handleMinInvest}
                error={minInvestErrorMsg}
              />
            </div>
          </div>

          <div>
            <label className="label pb-2" htmlFor="maxAmount">
              Maximum investment to join the Pool
            </label>
            <div id="maxAmount">
              <CurrencyInput
                value={maxInvest}
                placeholder={valueAsDollarString}
                onChange={handleMaxInvest}
                error={maxInvestErrorMsg}
              />
            </div>
          </div>

          <div>
            <label className="label pb-2" htmlFor="maxMembers">
              Maximum members
            </label>
            <input
              className="textfield py-4 mt-2"
              id="maxMembers"
              type="number"
              placeholder="50"
              value={maxMembers}
              onChange={(e) => {
                const members = Number(e.target.value);
                setMaxMembers(Math.min(Math.max(members, 0), 50) || '');
              }}
            />
          </div>

          <div>
            <HintLabel
              className="label pb-2"
              htmlFor="governance"
              title="Governance Token Name"
              hint="Your Pool will have a Governance Token which represents Votes in the Pool. The more you invest, the more Governance Tokens you receive. 1 Governance Token = 1 Vote"
            />
            <input
              className="textfield py-4 mt-2"
              id="governance"
              type="text"
              placeholder={`${poolName}Token`}
              value={tokenName}
              onChange={(e) => {
                setTokenNameTouched(e.target.value.length > 0);
                setTokenName(e.target.value);
              }}
            />
          </div>
          <div>
            <label className="label pb-2" htmlFor="governanceSym">
              Token Symbol
            </label>
            <input
              className="textfield py-4 mt-2"
              id="governanceSym"
              type="text"
              placeholder="TKN"
              value={tokenSymbol}
              onChange={(e) => {
                setTokenSymbolTouched(e.target.value.length > 0);
                setTokenSymbol(e.target.value);
              }}
            />
          </div>
          <div>
            <HintLabel
              className="label pb-2"
              htmlFor="publicPool"
              title="Public Pool"
              hint="If you decide to create a public Pool, everyone will be able to join, until the Max Member Limit is reached"
            />
            <Switch
              checked={isPublic}
              onChange={(_, checked) => setIsPublic(checked)}
            />
          </div>
          <div>
            <label className="label pb-2" htmlFor="autoLiquidateTs">
              Automatically Close Pool At
            </label>
            <input
              className="textfield py-4 px-3 mt-2"
              id="autoLiquidateTs"
              type="datetime-local"
              onChange={(e) =>
                setAutoLiquidateTs(Number(new Date(e.target.value)))
              }
            />
          </div>
        </Stack>
      </Collapse>
    </Stack>
  );
}
