import {
  Collapse,
  DialogContent,
  DialogContentText,
  Stack,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { BsImage } from 'react-icons/bs';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';
import HintLabel from '../../utils/hintLabel';
import CurrencyInput from '/components/utils/currencyInput';
import MemberInput from '/components/members/input';

export default function NewPoolConfigStep(props) {
  const {
    user,
    members,
    setMembers,
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
    <Stack spacing={1} className="mt-7">
      <div className="mb-2">
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

      <div className="pb-3">
        <label className="label pb-2 " htmlFor="value">
          Your Investment
        </label>
        <div id="amount">
          <CurrencyInput
            value={value}
            placeholder="$ 50.00"
            onChange={handleValueChange}
            error={valueErrorMsg}
          />
        </div>
      </div>

      <div>
        <label className="label sm:pr-52 mt-5" htmlFor="poolName">
          Invite your friends via WunderPass
        </label>
        <MemberInput
          user={user}
          multiple
          selectedMembers={members}
          setSelectedMembers={setMembers}
        />
      </div>

      <Divider />

      <div className="flex justify-between items-center pt-4">
        <div className="flex flex-row justify-between items-center">
          <Alert severity="info">
            You can invite friends without a WunderPass after creating the Pool!
          </Alert>
        </div>
      </div>
    </Stack>
  );
}
