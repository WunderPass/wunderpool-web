import { Typography, Skeleton, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { currency } from '/services/formatter';

function BettingBox(props) {
  const { user, bettingService } = props;
  const [loading, setLoading] = useState(true);
  const [totalMoneyStake, setTotalMoneyStake] = useState(0);
  const [totalPotSize, setTotalPotSize] = useState(0);

  const calculateTotalStake = () => {
    var total = bettingService.games.reduce(
      (accum, game) => accum + game.stake,
      0
    );
    let formatedValue = total / 1000000; //TODO
    setTotalMoneyStake(currency(formatedValue));
  };

  const calculateTotalPot = () => {
    var total = bettingService.games.reduce(
      (accum, game) => accum + game.stake * game.participants.length,
      0
    );
    let formatedValue = total / 1000000; //TODO
    setTotalPotSize(currency(formatedValue));
  };

  useEffect(() => {
    if (!bettingService.games) return;
    calculateTotalStake();
    calculateTotalPot();
  }, [bettingService.games]);

  useEffect(() => {
    if (user.isReady) {
      setLoading(false);
    }
  }, [user.isReady]);

  return !loading ? (
    <>
      <div className="  ">
        <div className="flex sm:h-full flex-col justify-between container-transparent-clean bg-casama-light p-5 mb-1 m:mr-8 w-full ">
          <div>
            <div className="flex flex-col container-white-p-0 p-5  mb-4">
              <div className="flex flex-row justify-between items-center ">
                <Typography className=" text-xl">Open Bets</Typography>
                <Typography className="text-2xl font-semibold">
                  {bettingService.games?.length}
                </Typography>
              </div>
            </div>

            <div className="flex flex-col container-white-p-0 p-5 ">
              <div className="flex  flex-row justify-between  items-center">
                <Typography className=" text-xl">Money at Stake</Typography>
                <Typography className="text-2xl font-semibold">
                  {totalMoneyStake}
                </Typography>
              </div>
              <Divider className="opacity-80 my-4" />

              <div className="flex flex-row justify-between  items-center">
                <Typography className=" text-xl">Possible Profit</Typography>
                <Typography className="text-2xl text-green-600 font-semibold">
                  + {totalPotSize}
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
