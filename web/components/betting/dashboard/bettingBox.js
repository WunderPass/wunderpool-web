import { Typography, Skeleton, Divider } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { currency } from '/services/formatter';

function BettingBox(props) {
  const { user, bettingService, isHistory } = props;

  const [totalPotSize, totalMoneyStake, openBets] = useMemo(() => {
    return isHistory
      ? bettingService.isReady
        ? [
            bettingService.userHistoryCompetitions?.reduce((accum, comp) => {
              accum = accum + comp.stake * comp.members?.length;
              return accum;
            }, 0),
            bettingService.userHistoryCompetitions?.reduce(
              (accum, comp) => accum + comp.stake,
              0
            ),
            bettingService.userHistoryCompetitions?.length,
          ]
        : [0, 0, 0]
      : bettingService.isReady
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
                  {' '}
                  {isHistory ? 'Total Bets' : 'Open Bets'}
                </Typography>
                <Typography className="text-2xl font-semibold">
                  {openBets}
                </Typography>
              </div>
            </div>
            {console.log('bettingService', bettingService)}
            <div className="flex flex-col container-white-p-0 p-5 ">
              {isHistory ? (
                <div className=" opacity-30 ">
                  <div className="flex flex-row justify-center items-center gap-2">
                    <Typography className="text-2xl  font-semibold">
                      COMING SOON
                    </Typography>
                  </div>
                  <Divider className="opacity-80 my-4" />

                  <div className="flex  flex-row justify-between items-center gap-2">
                    <Typography className="text-xl">Money Lost</Typography>
                    <Typography className="text-2xl text-red-600 font-semibold">
                      {/* {currency(totalMoneyStake)} */} -
                    </Typography>
                  </div>
                  <Divider className="opacity-80 my-4" />
                  <div className="flex flex-row justify-between items-center gap-2">
                    <Typography className="text-xl">Winnings</Typography>
                    <Typography className="text-2xl text-green-600 font-semibold">
                      {/* {currency(totalPotSize)} */} -
                    </Typography>
                  </div>
                </div>
              ) : (
                <>
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
