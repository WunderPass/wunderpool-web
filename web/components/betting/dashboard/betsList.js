import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaMoneyCheck } from 'react-icons/fa';
import { Typography, Skeleton } from '@mui/material';
import AdvancedPoolDialog from '/components/betting/dialogs/advancedPool/dialog';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import DashboardGameCard from '/components/betting/games/dashboardGameCard';
import Link from 'next/link';

export default function BetsList(props) {
  const { user, bettingService, eventTypeSort, handleError } = props;
  const [open, setOpen] = useState(false);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();

  const router = useRouter();

  const handleOpenClose = () => {
    if (open) {
      goBack(() => removeQueryParam('betsList'));
    } else {
      addQueryParam({ betsList: 'betsList' }, false);
    }
  };

  useEffect(() => {
    setOpen(router.query?.betsList ? true : false);
  }, [router.query]);

  return bettingService.bettingGames ? (
    bettingService.bettingGames.length > 0 ? (
      <div className="lg:grid lg:grid-cols-1 lg:gap-6 w-full">
        {bettingService.bettingGames.map((bettingGame, i) => {
          if (
            bettingGame.event.competitionName == eventTypeSort ||
            eventTypeSort == 'All Events'
          ) {
            return (
              <>
                <DashboardGameCard
                  bettingGame={bettingGame}
                  user={user}
                  {...props}
                />
              </>
            );
          }
        })}
      </div>
    ) : (
      <div className="container-white">
        <div className="flex flex-col items-center ">
          <div className="border-solid text-casama-blue rounded-full bg-casama-extra-light-blue p-5 my-2 mt-6 mb-4">
            <FaMoneyCheck className="text-4xl" />
          </div>
          <div className="my-4 mb-10 text-lg text-center">
            <Typography variant="h7">
              You have no open Bets currently. Go to the betting site to join or
              create new bets.
            </Typography>
          </div>
          <Link href="/betting/pools">
            <button className="btn-casama-white justify-center items-center w-full my-5 py-3.5 px-3 mb-0 text-lg font-semibold ">
              Check possible Bets
            </button>
          </Link>
        </div>
        <AdvancedPoolDialog open={open} setOpen={handleOpenClose} {...props} />
      </div>
    )
  ) : (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  );
}
