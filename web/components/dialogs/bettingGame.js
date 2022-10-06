import { DialogActions, Stack, Typography } from '@mui/material';
import { useState, useMemo } from 'react';
import CurrencyInput from '/components/utils/currencyInput';
import TransactionFrame from '../utils/transactionFrame';
import { currency } from '/services/formatter';
import ResponsiveDialog from '../utils/responsiveDialog';
import EventInput from '../events/input';
import { registerGame } from '../../services/contract/betting/games';

const PayoutRules = [
  { label: 'Winner Takes It All', value: 0 },
  { label: 'Proportional', value: 1 },
];

function OptionButton({ option, value, onClick }) {
  const buttonClass =
    option.value == value
      ? 'bg-casama-blue text-white text-md h-full py-2 px-2 rounded-lg w-full'
      : 'text-black text-md h-full py-2 px-2 rounded-lg w-full';

  return (
    <div className="flex items-center justify-center w-full">
      <button className={buttonClass} onClick={() => onClick(option.value)}>
        {option.label}
      </button>
    </div>
  );
}

export default function BettingGameDialog(props) {
  const { open, wunderPool, handleSuccess, handleError, handleOpenClose } =
    props;
  const [event, setEvent] = useState(0);
  const [stake, setStake] = useState(null);
  const [stakeInTokens, setStakeInTokens] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [payoutRule, setPayoutRule] = useState(0);
  const [loading, setLoading] = useState(false);

  const maxStake = useMemo(() => {
    return (
      (Math.min(...wunderPool.members.map((m) => m.share)) *
        wunderPool.usdcBalance) /
      100
    );
  }, [wunderPool.members, wunderPool.usdcBalance]);

  const totalTokens = useMemo(() => {
    return wunderPool.members.map((m) => m.tokens).reduce((a, b) => a + b, 0);
  }, [wunderPool.members, wunderPool.usdcBalance]);

  const submitDisabled =
    !stakeInTokens || stakeInTokens <= 0 || loading || event.id == undefined;

  const handleCreate = () => {
    setLoading(true);
    registerGame(
      wunderPool.poolName,
      stakeInTokens,
      wunderPool.governanceToken.address,
      event.id,
      payoutRule,
      wunderPool.poolAddress
    )
      .then((res) => {
        console.log(res);
        handleSuccess('Created Betting Group');
        handleOpenClose(true);
        wunderPool.determineBettingGames();
      })
      .catch((err) => {
        console.log(err);
        handleError(err);
      })
      .then(() => setLoading(false));
  };

  const handleInput = (value, float) => {
    setStake(value);
    setStakeInTokens(
      Math.floor((totalTokens / wunderPool.usdcBalance) * float)
    );
    if (float && float > maxStake) {
      setErrorMsg(`Maximum Stake of ${currency(maxStake)} surpassed`);
    } else {
      setErrorMsg(null);
    }
  };

  return (
    <ResponsiveDialog
      maxWidth="md"
      open={open}
      onClose={() => handleOpenClose(true)}
      title="Create A Betting Group"
      actions={
        !loading && (
          <DialogActions className="flex items-center justify-center mx-4">
            <div className="flex flex-col items-center justify-center w-full">
              <button
                className="btn-neutral w-full py-3"
                onClick={() => handleOpenClose(true)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-casama w-full py-3 mt-2"
                onClick={handleCreate}
                disabled={submitDisabled}
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
            Creating Betting Group...
          </Typography>
        </div>
      ) : (
        <Stack spacing={2}>
          <div></div>
          <EventInput setEvent={setEvent} />
          <Typography>Stake</Typography>
          <CurrencyInput
            value={stake}
            placeholder={currency(10)}
            onChange={handleInput}
            error={errorMsg}
          />
          <Typography>Payout Rule</Typography>
          <div className="flex flex-row bg-gray-200 p-1 rounded-xl justify-between">
            {PayoutRules.map((option, i) => {
              return (
                <OptionButton
                  key={`payout-rules-option-${i}`}
                  option={option}
                  value={payoutRule}
                  onClick={setPayoutRule}
                />
              );
            })}
          </div>
        </Stack>
      )}
    </ResponsiveDialog>
  );
}
