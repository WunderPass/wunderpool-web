import { Typography, Skeleton, Divider } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { currency } from '/services/formatter';

function BettingBox(props) {
  const { user, bettingService } = props;

  const [totalPotSize, totalMoneyStake, openBets] = useMemo(() => {
    return bettingService.isReady
      ? [
          bettingService.userCompetitions?.reduce((accum, comp) => {
            accum = accum + comp.stake * comp.members?.length;
            return accum;
          }, 0),
          bettingService.userCompetitions?.reduce(
            (accum, comp) => accum + comp.stake,
            0
          ),
          bettingService.userCompetitions?.length,
        ]
      : [0, 0, 0];
  }, [
    bettingService.isReady,
    bettingService.userCompetitions,
    bettingService.userCompetitions.length,
  ]);

  return bettingService.isReady ? (
    <>
      <div className="">
        <div className="flex sm:h-full flex-col justify-between container-transparent-clean bg-casama-light p-5 mb-1 m:mr-8 w-full ">
          <div>
            <div className="flex flex-col container-white-p-0 p-5  mb-4">
              <div className="flex flex-row justify-between items-center gap-2">
                <Typography className="text-xl">Open Bets</Typography>
                <Typography className="text-2xl font-semibold">
                  {openBets}
                </Typography>
              </div>
            </div>

            <div className="flex flex-col container-white-p-0 p-5 ">
              <div className="flex  flex-row justify-between items-center gap-2">
                <Typography className="text-xl">Money at Stake</Typography>
                <Typography className="text-2xl font-semibold">
                  {currency(totalMoneyStake)}
                </Typography>
              </div>
              <Divider className="opacity-80 my-4" />

              <div className="flex flex-row justify-between items-center gap-2">
                <Typography className="text-xl">Possible Profit</Typography>
                <Typography className="text-2xl text-green-600 font-semibold">
                  {currency(totalPotSize)}
                </Typography>
              </div>
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
