import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { MdGroups } from 'react-icons/md';
import { Typography, Skeleton } from '@mui/material';
import AdvancedPoolDialog from '/components/investing/dialogs/advancedPool/dialog';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import DashboardGameCard from '/components/betting/games/dashboardGameCard';

export default function BetsList(props) {
  const { user, bettingService, handleError } = props;
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
          return (
            <>
              <DashboardGameCard
                bettingGame={bettingGame}
                user={user}
                {...props}
              />
            </>
          );
        })}
      </div>
    ) : (
      <div className="container-white">
        <div className="flex flex-col items-center ">
          <div className="border-solid text-casama-blue rounded-full bg-casama-extra-light-blue p-5 my-2 mt-6 mb-4">
            <MdGroups className="text-4xl" />
          </div>
          <div className="my-2 mb-10">
            <Typography variant="h7">
              Get invited to an betting pool or start one and invite others in
              minutes
            </Typography>
            <div className="flex justify-center mt-2 cursor-pointer">
              <a
                href={`https://www.youtube.com/watch?v=vz6rXuKOyZ4`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Typography className="text-casama-blue justify-center">
                  (See Demo)
                </Typography>
              </a>
            </div>
          </div>
          <button
            className="btn-casama-white items-center w-full my-5 py-3.5 px-3 mb-0 text-md "
            onClick={handleOpenClose}
          >
            Create your first pool
          </button>
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
