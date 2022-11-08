import { Stack, Divider, Typography, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import GameCard from './gameCard';
import TabBar from '/components/general/utils/tabBar';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import BettingGameDialog from '../dialogs/bettingGame';
import CiMoneyCheck1 from 'react-icons/ci';

export default function GameList(props) {
  const { pool, wunderPool, user, handleError } = props;
  const router = useRouter();
  const [openBet, setOpenBet] = useState(false);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();

  const totalTokens = useMemo(() => {
    return pool.members.map((m) => m.tokens).reduce((a, b) => a + b, 0);
  }, [pool.members, pool.usdcBalance]);

  useEffect(() => {
    setOpenBet(router.query?.bet ? Number(router.query.bet) : null);
  }, [router.query]);

  const handleOpenCloseBetting = (onlyClose = false) => {
    if (onlyClose && !openBet) return;
    if (openBet) {
      goBack(() => removeQueryParam('dialog'));
    } else {
      addQueryParam({ dialog: 'newGroupBet' }, false);
    }
  };

  return !wunderPool.loadingState.bets ? (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  ) : wunderPool.bettingCompetitions.length > 0 ? (
    <Stack style={{ maxWidth: '100%' }}>
      {wunderPool.bettingCompetitions.filter((bet) => !bet.closed).length > 0 &&
        wunderPool.bettingCompetitions
          .filter((bet) => !bet.closed)
          .map((game) => {
            return (
              <div
                key={`game-card-${game.version}-${game.id}`}
                className="mb-16"
              >
                <GameCard
                  openBet={openBet}
                  setOpenBet={setOpenBet}
                  game={game}
                  totalTokens={totalTokens}
                  wunderPool={wunderPool}
                  {...props}
                />
              </div>
            );
          })}
    </Stack>
  ) : (
    <div className="container-gray border-2 mt-4">
      <Stack sx={{ textAlign: 'center' }}>
        <Typography className="mt-3" variant="h5">
          No Open Bets
        </Typography>
        <Typography className="mb-2 mt-3" variant="subtitle1">
          Create a new bet below!
        </Typography>
        <button
          className="btn-casama items-center w-full mb-2 mt-6 py-3 px-3 text-lg"
          onClick={() => {
            handleOpenCloseBetting();
          }}
        >
          Start Betting Game
        </button>
        <BettingGameDialog
          open={openBet}
          wunderPool={wunderPool}
          handleOpenClose={handleOpenCloseBetting}
          {...props}
        />
      </Stack>
    </div>
  );
}
