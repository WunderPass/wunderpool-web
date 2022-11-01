import { Stack, Divider, Alert } from '@mui/material';
import { useState } from 'react';
import CurrencyInput from '/components/general/utils/currencyInput';
import MemberInput from '/components/general/members/input';

export default function NewPoolConfigStep(props) {
  const {
    user,
    members,
    setMembers,
    poolName,
    setPoolName,
    value,
    setValue,
    valueErrorMsg,
    setValueErrorMsg,
    setTokenName,
    setTokenSymbol,
  } = props;
  const [poolNameTouched, setPoolNameTouched] = useState(poolName.length > 0);

  const handleValueChange = (val, float) => {
    setValue(val);
    let msg = null;
    if (float < 3) msg = 'Your Invest must be at least $3.00';
    if (float > user.usdBalance) msg = 'Not enough USD';
    setValueErrorMsg(msg);
  };

  const handleNameChange = (e) => {
    let name = e.target.value;
    setPoolName(name);
    setPoolNameTouched(true);
    setTokenName(
      `${name.trim()}${name.match(' ') ? ' ' : name.match('-') ? '-' : ''}Token`
    );
    setTokenSymbol(name.replaceAll(' ', '').slice(0, 3).toUpperCase() || 'PGT');
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
          Pool entrance amount
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

      <Alert severity="info">
        You can invite friends without a WunderPass after creating the Pool!
      </Alert>
    </Stack>
  );
}
