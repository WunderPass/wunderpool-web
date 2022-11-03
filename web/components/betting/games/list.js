import { Stack, Divider, Typography, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import GameCard from './gameCard';
import TabBar from '/components/general/utils/tabBar';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import BettingGameDialog from '../dialogs/bettingGame';

function NoOpenBets(props) {
  const { wunderPool, handleOpenCloseBetting, openBet } = props;

  return (
    <div className="container-gray border-2 mt-4">
      <Stack sx={{ textAlign: 'center' }}>
        <Typography className="mt-3" variant="h5">
          No Open Bets
        </Typography>
        {wunderPool.isMember && (
          <>
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
          </>
        )}
        <BettingGameDialog
          open={openBet}
          handleOpenClose={handleOpenCloseBetting}
          {...props}
        />
      </Stack>
    </div>
  );
}

export default function GameList(props) {
  const { wunderPool } = props;
  const router = useRouter();
  const [openBet, setOpenBet] = useState(false);
  const [gamesTab, setGamesTab] = useState(router.query.gameTab || 0);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();

  const totalTokens = useMemo(() => {
    return wunderPool.members.map((m) => m.tokens).reduce((a, b) => a + b, 0);
  }, [wunderPool.members, wunderPool.usdcBalance]);

  const [allGames, openGames, closedGames] = useMemo(() => {
    return [
      wunderPool.bettingGames,
      wunderPool.bettingGames.filter((bet) => !bet.closed),
      wunderPool.bettingGames.filter((bet) => bet.closed),
    ];
  }, [wunderPool.loadingState.bets]);

  useEffect(() => {
    setGamesTab(Number(router.query?.gameTab || 0));
    setOpenBet(router.query?.bet ? Number(router.query.bet) : null);
  }, [router.query]);

  const handleClick = (index) => {
    if (gamesTab == index) return;
    index === 0
      ? removeQueryParam('gameTab')
      : addQueryParam({ gameTab: index });
  };

  const handleOpenCloseBetting = (onlyClose = false) => {
    if (onlyClose && !openBet) return;
    if (openBet) {
      goBack(() => removeQueryParam('dialog'));
    } else {
      addQueryParam({ dialog: 'newGroupBet' }, false);
    }
  };

  if (!wunderPool.loadingState.bets)
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        sx={{ height: '100px', borderRadius: 3 }}
      />
    );

  return allGames.length > 0 ? (
    <Stack style={{ maxWidth: '100%' }}>
      <div className="flex flex-col w-full">
        <TabBar
          tabs={['Open', 'History']}
          tab={gamesTab}
          handleClick={handleClick}
          proposals={wunderPool.proposals}
          parent="list"
        />
        <Divider className="mb-6 mt-1 opacity-70" />
      </div>

      {gamesTab == 0 && openGames.length > 0
        ? openGames.map((game) => {
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
          })
        : gamesTab == 0 && (
            <NoOpenBets
              handleOpenCloseBetting={handleOpenCloseBetting}
              openBet={openBet}
              {...props}
            />
          )}
      {gamesTab == 1 &&
        closedGames.map((game) => {
          return (
            <div
              className="mb-16"
              key={`game-card-history-${game.version}-${game.id}`}
            >
              <GameCard
                openBet={openBet}
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
    <NoOpenBets
      handleOpenCloseBetting={handleOpenCloseBetting}
      openBet={openBet}
      {...props}
    />
  );
}
