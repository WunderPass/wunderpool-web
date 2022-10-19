import {
  DialogActions,
  Stack,
  Typography,
  IconButton,
  Popover,
  Divider,
} from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import CurrencyInput from '/components/utils/currencyInput';
import TransactionFrame from '../utils/transactionFrame';
import { currency } from '/services/formatter';
import ResponsiveDialog from '../utils/responsiveDialog';
import EventInput from '../events/input';
import { registerGame } from '../../services/contract/betting/games';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '../../services/shareLink';
import { FaRegQuestionCircle } from 'react-icons/fa';

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
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [infoBoxAnchorEl, setInfoBoxAnchorEl] = useState(false);

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
    //currently not able to use bets below 0.1€
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

  const showPayoutRuleInfo = (e) => {
    setInfoBoxAnchorEl(e.currentTarget);
    setShowInfo(!showInfo);
  };

  const handleClose = () => {
    setShowInfo(false);
  };

  useEffect(() => {
    setSubmitDisabled(
      !stakeInTokens || stakeInTokens <= 0 || loading || event.id == undefined
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
          <div></div>
          <EventInput setEvent={setEvent} />
          <Typography>Stake</Typography>
          <CurrencyInput
            value={stake}
            placeholder={currency(10)}
            onChange={handleInput}
            error={errorMsg}
          />
          <div className="flex flex-row items-center">
            <Typography>Payout Rule</Typography>

            <button
              className="cursor-pointer"
              onClick={(e) => showPayoutRuleInfo(e)}
            >
              <FaRegQuestionCircle className="ml-2 text-xl mb-1 text-casama-blue" />
            </button>
            <Popover
              open={showInfo}
              onClose={handleClose}
              anchorEl={infoBoxAnchorEl}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <Typography>
                <div className="flex flex-col text-gray-500 text-sm">
                  <div className="flex flex-col m-2 mx-3">
                    <span className="text-base font-bold underline sm:text-center mb-1">
                      Scoring system:
                    </span>
                    <span>
                      <span className="font-bold">3 Points:</span> Hit the exact
                      result of the game.
                    </span>
                    <span>
                      <span className="font-bold">2 Points: </span> Hit the
                      winning team and the right goal difference between the
                      teams.
                    </span>
                    <span>
                      <span className="font-bold">1 Point: </span> Hit the
                      winning team.{' '}
                    </span>
                    <span>
                      <span className="font-bold">0 Points: </span> Bet on the
                      wrong team.
                    </span>
                  </div>
                  <Divider flexItem />
                  <div className="flex sm:flex-row flex-col">
                    <div className="m-2 mx-3">
                      <div className="flex flex-col w-60 ">
                        <span className="text-base font-bold underline sm:text-center mb-1">
                          Winner Takes It All:
                        </span>
                        <span>
                          The player with the most points wins the pot. If 2 or
                          more players have the same amount of points they split
                          the pot.
                        </span>
                      </div>
                    </div>
                    <Divider
                      orientation="vertical"
                      flexItem
                      className="hidden sm:flex"
                    />
                    <Divider className="sm:hidden flex" flexItem />
                    <div className="m-2 mx-3">
                      <div className="flex flex-col w-60">
                        <span className="text-base font-bold underline sm:text-center mb-1">
                          Proportional:
                        </span>
                        <span>
                          Win a proportion of the pot in the size of the points
                          you scored, relative to the total amount of scored
                          points.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Typography>
            </Popover>
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
