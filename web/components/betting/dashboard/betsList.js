import { FaMoneyCheck } from 'react-icons/fa';
import { Typography, Skeleton } from '@mui/material';
import DashboardGameCard from '/components/betting/games/dashboardGameCard';
import Link from 'next/link';

export default function BetsList(props) {
  const { user, bettingService, eventTypeSort } = props;

  return bettingService.bettingGames ? (
    bettingService.bettingGames.length > 0 ? (
      <div className="lg:grid lg:grid-cols-1 lg:gap-6 w-full">
        {bettingService.bettingGames.map((bettingGame, i) => {
          if (
            bettingGame.event.competitionName == eventTypeSort ||
            eventTypeSort == 'All Events'
          ) {
            return (
              <DashboardGameCard
                key={`dashboard-game-card-${bettingGame.id}`}
                bettingGame={bettingGame}
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
