import { FaMoneyCheck } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { Typography, Skeleton } from '@mui/material';
import DashboardGameCard from '/components/betting/games/dashboardGameCard';
import Link from 'next/link';

export default function BetsList(props) {
  const { user, bettingService, eventTypeSort, sortId, isSortById } = props;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bettingService.isReady) return;
    setLoading(false);
  }, [bettingService.isReady]);

  return !loading ? (
    bettingService.userCompetitions.length > 0 ? (
      <div className={'grid grid-cols-1 gap-5 w-full'}>
        {bettingService.userCompetitions.map((comp, i) => {
          if (isSortById) {
            if (comp.id == sortId) {
              return (
                <DashboardGameCard
                  key={`dashboard-game-card-${game.id}`}
                  game={game}
                  user={user}
                  {...props}
                />
              );
            }
          } else if (
            game.event.competitionName == eventTypeSort ||
            eventTypeSort == 'All Events'
          ) {
            return (
              <DashboardGameCard
                key={`dashboard-game-card-${game.id}`}
                game={game}
                user={user}
                {...props}
              />
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
