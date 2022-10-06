import { Stack, Divider, Typography, DialogActions } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import { MdSportsSoccer } from 'react-icons/md';
import { registerParticipant } from '../../services/contract/betting/games';
import { currency } from '../../services/formatter';
import Avatar from '../members/avatar';
import Timer from '../proposals/timer';
import ResponsiveDialog from '../utils/responsiveDialog';
import TransactionFrame from '../utils/transactionFrame';
import TabBar from '/components/utils/tabBar';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';

function PlaceBetDialog({
  open,
  setOpen,
  game,
  user,
  wunderPool,
  handleSuccess,
  handleError,
}) {
  const [loading, setLoading] = useState(false);
  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');

  const handleCreate = () => {
    setLoading(true);
    registerParticipant(
      game.id,
      [Number(guessOne), Number(guessTwo)],
      user.address,
      user.wunderId || wunderPool.resolveMember(user.address),
      game.tokenAddress,
      game.stake
    )
      .then((res) => {
        console.log(res);
        handleSuccess(`Placed Bet on ${game.event.name}`);
        setOpen(false);
        wunderPool.determineBettingGames();
      })
      .catch(handleError)
      .then(() => setLoading(false));
  };

  return (
    <ResponsiveDialog
      maxWidth="sm"
      open={open}
      onClose={() => setOpen(false)}
      title="Place Your Bet"
      actions={
        !loading && (
          <DialogActions className="flex items-center justify-center mx-4">
            <div className="flex flex-col items-center justify-center w-full">
              <button
                className="btn-neutral w-full py-3"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-casama w-full py-3 mt-2"
                onClick={handleCreate}
                disabled={loading || !guessOne || !guessTwo}
              >
                Bet
              </button>
            </div>
          </DialogActions>
        )
      }
    >
      {loading ? (
        <div className="px-6 pb-1">
          <Typography className="text-md text-center" color="GrayText">
            Placing Bet...
          </Typography>
        </div>
      ) : (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          mt={1}
          spacing={1}
        >
          <Typography>{game.event.teams[0]}</Typography>
          <div className="w-12">
            <input
              className="textfield text-center py-1 px-3"
              value={guessOne}
              onChange={(e) => setGuessOne(e.target.value)}
            />
          </div>
          <Typography>:</Typography>
          <div className="w-12">
            <input
              className="textfield text-center py-1 px-3"
              value={guessTwo}
              onChange={(e) => setGuessTwo(e.target.value)}
            />
          </div>
          <Typography>{game.event.teams[1]}</Typography>
        </Stack>
      )}
      {<TransactionFrame open={loading} />}
    </ResponsiveDialog>
  );
}

function GameCard(props) {
  const { game, totalTokens, wunderPool } = props;
  const [open, setOpen] = useState(false);

  const usersBet = game.participants.find(
    (p) => p.address.toLowerCase() == wunderPool.userAddress.toLowerCase()
  )?.prediction;

  return (
    <div className="container-gray mb-6">
      <Stack direction="row" spacing={1} alignItems="center">
        <MdSportsSoccer className="text-5xl text-casama-blue" />
        <Stack spacing={1} flexGrow="1">
          <Typography className="text-xl ">{game.event.name}</Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Timer start={Number(new Date())} end={game.event.endDate} />
            <Typography className="text-xl ">
              {`${currency(
                (game.stake *
                  (wunderPool.assetBalance + wunderPool.usdcBalance)) /
                  totalTokens
              )} Stake`}
            </Typography>
          </Stack>
          {game.participants.length > 0 && (
            <div className="flex pl-2">
              {game.participants.map((participant, i) => {
                return (
                  <Avatar
                    key={`game-avatar-${participant.address}`}
                    wunderId={participant.wunderId}
                    tooltip={`${participant.wunderId}`}
                    text={participant.wunderId ? participant.wunderId : '0-X'}
                    color={['green', 'blue', 'red'][i % 3]}
                    i={i}
                  />
                );
              })}
            </div>
          )}
          {usersBet ? (
            <div className="text-xl">
              Your Bet: {usersBet[0]}:{usersBet[1]}
            </div>
          ) : (
            <button
              className="btn-casama py-2 text-xl"
              onClick={() => setOpen(true)}
            >
              Bet Now
            </button>
          )}
        </Stack>
      </Stack>
      <PlaceBetDialog open={open} setOpen={setOpen} {...props} />
    </div>
  );
}

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
