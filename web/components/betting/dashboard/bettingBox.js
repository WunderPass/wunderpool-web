import { Typography, Skeleton, Divider } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { compAddr } from '../../../services/memberHelpers';
import { currency } from '/services/formatter';

function BettingBox(props) {
  const { user, bettingService, isHistory } = props;
  const [profits, setProfits] = useState(0);
  const [moneyAtStake, setMoneyAtStake] = useState(0);
  const [openBets, setOpenBets] = useState(0);

  const calculateValues = () => {
    let profit = 0;
    let moneyAtStake = 0;
    isHistory
      ? bettingService.userHistoryCompetitions.map((comp) => {
          moneyAtStake += comp.stake;
          profit +=
            comp.members.find((m) => compAddr(m.address, user.address))
              ?.profit || 0;
        })
      : bettingService.userCompetitions.map((comp) => {
          moneyAtStake += comp.stake;
          profit += comp.stake * Math.max(comp.members?.length - 1, 0);
        });

    setOpenBets(
      isHistory
        ? bettingService.userHistoryCompetitions.length
        : bettingService.userCompetitions.length
    );
    setMoneyAtStake(moneyAtStake);
    setProfits(profit);
  };

  useEffect(() => {
    if (!bettingService.isReady) return;
    calculateValues();
  }, [
    isHistory,
    bettingService.isReady,
    bettingService.userCompetitions,
    bettingService.userHistoryCompetitions,
  ]);

  return bettingService.isReady ? (
    <>
      <div className="">
        <div className="flex sm:h-full flex-col justify-between container-transparent-clean bg-casama-light p-5 mb-1 m:mr-8 w-full ">
          <div>
            <div className="flex flex-col container-white-p-0 p-5  mb-4">
              <div className="flex flex-row justify-between items-center gap-2">
                <Typography className="text-xl">
                  {isHistory ? 'Total Bets' : 'Open Bets'}
                </Typography>
                <Typography className="text-2xl font-semibold">
                  {openBets}
                </Typography>
              </div>
            </div>
            <div className="flex flex-col container-white-p-0 p-5 ">
              {isHistory ? (
                <>
                  <div className="flex  flex-row justify-between items-center gap-2">
                    <Typography className="text-xl">Money Bet</Typography>
                    <Typography className="text-2xl font-semibold">
                      {currency(moneyAtStake)}
                    </Typography>
                  </div>
                  <Divider className="opacity-80 my-4" />
                  <div className="flex flex-row justify-between items-center gap-2">
                    <Typography className="text-xl">
                      {profits >= 0 ? 'Profit' : 'Losses'}
                    </Typography>
                    <Typography
                      className={`text-2xl ${
                        profits >= 0 ? 'text-green-600' : 'text-red-600'
                      } font-semibold`}
                    >
                      {currency(profits)}
                    </Typography>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex  flex-row justify-between items-center gap-2">
                    <Typography className="text-xl">Money at Stake</Typography>
                    <Typography className="text-2xl font-semibold">
                      {currency(moneyAtStake)}
                    </Typography>
                  </div>
                  <Divider className="opacity-80 my-4" />
                  <div className="flex flex-row justify-between items-center gap-2">
                    <Typography className="text-xl">Possible Profit</Typography>
                    <Typography className="text-2xl text-green-600 font-semibold">
                      {currency(profits)}
                    </Typography>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  );
}

export default BettingBox;
