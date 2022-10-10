import { Stack, Typography, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import { MdSportsSoccer } from 'react-icons/md';
import { currency } from '../../services/formatter';
import PlaceBetDialog from '../dialogs/placeBet';
import Avatar from '../members/avatar';
import Timer from '../proposals/timer';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '../../services/shareLink';

function ParticipantTable({ game, stake }) {
  const { participants, event } = game;

  return (
    <table className="table-auto">
      <tbody>
        {participants.map((participant, i) => {
          return (
            <tr
              key={`participant-${participant.address}`}
              className="border-b border-gray-300"
            >
              <td className="py-1">
                <div className="flex flex-row items-center ml-3 gap-3">
                  <Avatar
                    wunderId={participant.wunderId}
                    tooltip={`${participant.wunderId}`}
                    text={participant.wunderId ? participant.wunderId : '0-X'}
                    color={['green', 'blue', 'red'][i % 3]}
                    i={i}
                  />
                  <Typography>
                    {participant.wunderId
                      ? participant.wunderId
                      : 'External User'}
                  </Typography>
                </div>
              </td>
              <td className="text-right py-1">
                <Typography className="">
                  {participant.prediction[0]}:{participant.prediction[1]}
                </Typography>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function GameCard(props) {
  const { game, totalTokens, wunderPool, handleSuccess } = props;
  const [open, setOpen] = useState(false);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const router = useRouter();

  const stake = (game.stake * wunderPool.usdcBalance) / totalTokens;
  const usersBet = game.participants.find(
    (p) => p.address.toLowerCase() == wunderPool.userAddress.toLowerCase()
  )?.prediction;

  const handleOpenBetNow = (onlyClose = false) => {
    if (onlyClose && !open) return;
    if (open) {
      goBack(() => removeQueryParam('bet'));
    } else {
      addQueryParam({ bet: game.id }, false);
    }
  };

  useEffect(() => {
    setOpen(router.query.bet == game.id);
  }, [router.query]);

  return (
    <div className="container-gray mb-6">
      <div className="flex items-center gap-2 flex-col sm:flex-row">
        <MdSportsSoccer className="text-5xl text-casama-blue" />
        <Stack spacing={1} flexGrow="1">
          <div className="flex flex-row items-center justify-start">
            <Typography className="text-xl ">{game.event.name}</Typography>
            <IconButton
              onClick={() =>
                handleShare(location.href, `Look at this Bet: `, handleSuccess)
              }
            >
              <ShareIcon className="text-casama-blue" />
            </IconButton>
          </div>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            {game.event.resolved ? (
              <div className="text-2xl">
                Outcome: {game.event.outcome[0]}:{game.event.outcome[1]}
              </div>
            ) : (
              <Timer start={Number(new Date())} end={game.event.endDate} />
            )}
            <Typography className="text-xl ">
              {`${currency(stake)} Stake`}
            </Typography>
          </Stack>
          {game.participants.length > 0 && (
            <ParticipantTable game={game} stake={stake} />
          )}
          {usersBet ? (
            <div className="text-xl">
              Your Bet: {usersBet[0]}:{usersBet[1]}
            </div>
          ) : (
            <button
              className="btn-casama py-2 text-xl"
              onClick={() => handleOpenBetNow()}
            >
              Bet Now
            </button>
          )}
        </Stack>
      </div>
      <PlaceBetDialog
        open={open}
        setOpen={setOpen}
        handleOpenBetNow={handleOpenBetNow}
        {...props}
      />
    </div>
  );
}
