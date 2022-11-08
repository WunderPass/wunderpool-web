import { DialogActions, Stack, Typography } from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import CurrencyInput from '/components/general/utils/currencyInput';
import { currency } from '/services/formatter';
import ResponsiveDialog from '/components/general/utils/responsiveDialog';
import EventInput from '/components/betting/events/input';
import { registerGame } from '/services/contract/betting/games';
import PayoutRuleInfoButton from '/components/general/utils/payoutRuleInfoButton';

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
  const [warningMsg, setWarningMsg] = useState(null);
  const [payoutRule, setPayoutRule] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const lowestStake = useMemo(() => {
    return (
      (Math.min(...wunderPool.members.map((m) => m.share)) *
        wunderPool.usdcBalance) /
      100
    );
  }, [wunderPool.members, wunderPool.usdcBalance]);

  const highestStake = useMemo(() => {
    return (
      (Math.max(...wunderPool.members.map((m) => m.share)) *
        wunderPool.usdcBalance) /
      100
    );
  }, [wunderPool.members, wunderPool.usdcBalance]);

  const totalTokens = useMemo(() => {
    return wunderPool.members.map((m) => m.tokens).reduce((a, b) => a + b, 0);
  }, [wunderPool.members, wunderPool.usdcBalance]);

  const handleCreate = () => {
    setLoading(true);
    registerGame(
      wunderPool.poolName,
      stakeInTokens,
      wunderPool.governanceToken.address,
      event,
      payoutRule,
      wunderPool.poolAddress
    )
      .then((res) => {
        console.log(res);
        handleSuccess('Created Betting Group');
        handleOpenClose(true);
        wunderPool.determineBettingCompetitions();
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
      Math.floor(
        (totalTokens / wunderPool.usdcBalance) *
          float *
          10 ** wunderPool.governanceToken.decimals
      )
    );
    // Validation to only allow bets wiht max amount same as the member with the least amount of stake
    if (float && float > highestStake) {
      setErrorMsg(`Maximum Stake of ${currency(highestStake)} surpassed`);
    } else {
      setErrorMsg(null);
    }

    if (float && float > lowestStake) {
      setWarningMsg(`Not everyone will be able to participate`);
    } else {
      setWarningMsg(null);
    }
  };

  useEffect(() => {
    setSubmitDisabled(
      !stakeInTokens ||
        stakeInTokens <= 0 ||
        loading ||
        event.id == undefined ||
        errorMsg
    );
  }, [stakeInTokens, loading, event.id]);

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
          <EventInput setEvent={setEvent} {...props} />
          <Typography>Entry price</Typography>
          <CurrencyInput
            value={stake}
            placeholder={currency(10)}
            onChange={handleInput}
            error={errorMsg}
          />
          {warningMsg && !errorMsg && (
            <div className="text-yellow-600" style={{ marginTop: 0 }}>
              {warningMsg}
            </div>
          )}
          <div className="flex flex-row items-center">
            <Typography>Payout Rule</Typography>
            <PayoutRuleInfoButton />
          </div>
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
