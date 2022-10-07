import { Stack, Divider } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import GameCard from './gameCard';
import TabBar from '/components/utils/tabBar';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';

export default function GameList(props) {
  const { wunderPool } = props;
  const router = useRouter();
  const [gamesTab, setGamesTab] = useState(router.query.gameTab || 0);
  const { addQueryParam } = UseAdvancedRouter();

  const totalTokens = useMemo(() => {
    return wunderPool.members.map((m) => m.tokens).reduce((a, b) => a + b, 0);
  }, [wunderPool.members, wunderPool.usdcBalance]);

  useEffect(() => {
    setGamesTab(Number(router.query?.gameTab || 0));
  }, [router.query]);

  useEffect(() => {
    addQueryParam({ gameTab: gamesTab });
  }, [gamesTab]);

  return (
    <Stack spacing={1} style={{ maxWidth: '100%' }}>
      <div className="flex flex-col w-full">
        <TabBar
          tabs={['Open', 'History']}
          tab={gamesTab}
          setTab={setGamesTab}
          proposals={wunderPool.proposals}
          parent="list"
        />
        <Divider className="mb-6 mt-1 opacity-70" />
      </div>
      {gamesTab == 0 &&
        wunderPool.bettingGames
          .filter((p) => !p.closed)
          .map((game) => {
            return (
              <GameCard
                key={`game-card-${game.id}`}
                game={game}
                totalTokens={totalTokens}
                {...props}
              />
            );
          })}
      {gamesTab == 1 &&
        wunderPool.bettingGames
          .filter((p) => p.closed)
          .map((game) => {
            return (
              <GameCard
                key={`game-card-${game.id}`}
                game={game}
                totalTokens={totalTokens}
                {...props}
              />
            );
          })}
    </Stack>
  );
}
