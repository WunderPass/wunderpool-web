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

  // return (
  //   <table className="table-auto">

  //     <tbody>
  //       {participants.map((participant, i) => {
  //         return (
  //           <tr
  //             key={`participant-${participant.address}`}
  //             className="border-b border-gray-300"
  //           >
  //             <td className="py-1 truncate ... ">
  //               <div className="flex flex-row items-center ml-3 gap-3 bg-red-300 w-full">
  //                 <Avatar
  //                   wunderId={participant.wunderId}
  //                   tooltip={`${participant.wunderId}`}
  //                   text={participant.wunderId ? participant.wunderId : '0-X'}
  //                   color={['green', 'blue', 'red'][i % 3]}
  //                   i={i}
  //                 />
  //                 <div className="text-clip overflow-hidden ..">
  //                   {participant.wunderId ? (
  //                     <div className=" text-clip overflow-hidden ..">
  //                       {participant.wunderId}
  //                     </div>
  //                   ) : (
  //                     'External User'
  //                   )}
  //                 </div>
  //               </div>
  //             </td>
  //             <td className="text-right py-1">
  //               <Typography className="">
  //                 {participant.prediction[0]}:{participant.prediction[1]}
  //               </Typography>
  //             </td>
  //           </tr>
  //         );
  //       })}
  //     </tbody>
  //   </table>
  // );

  return (
    <div className="">
      {participants.map((participant, i) => {
        return (
          <div
            key={`participant-${participant.address}`}
            className="flex flex-row border-b border-gray-300 w-full "
          >
            <div className="flex flex-row items-center justify-between pl-2 gap-3 w-full">
              <div className=" flex flex-row justify-start w-5/6">
                <div className="flex">
                  <Avatar
                    wunderId={participant.wunderId}
                    tooltip={`${participant.wunderId}`}
                    text={participant.wunderId ? participant.wunderId : '0-X'}
                    color={['green', 'blue', 'red'][i % 3]}
                    i={i}
                  />
                </div>
                <div className="flex items-center justify-start ml-2 wtext-ellipsis overflow-hidden mr-4 ...">
                  {participant.wunderId ? (
                    <div className="truncate ...">{participant.wunderId}</div>
                  ) : (
                    'External User'
                  )}
                </div>
              </div>
              <div className=" text-right py-3 w-full text-xl">
                {participant.prediction[0]}:{participant.prediction[1]}
              </div>
            </div>
          </div>
        );
      })}
    </div>
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
    <div className="container-gray mb-6 ">
      <div className="flex items-start gap-2 flex-col sm:flex-row b">
        <MdSportsSoccer className="text-5xl text-casama-blue " />
        <div className="flex flex-col flex-1 gap 1  w-full">
          <div className="flex flex-row items-center justify-start ">
            <Typography className="text-xl ">{game.event.name}</Typography>
            <IconButton
              onClick={() =>
                handleShare(location.href, `Look at this Bet: `, handleSuccess)
              }
            >
              <ShareIcon className="text-casama-blue" />
            </IconButton>
          </div>
          <div className="flex flex-row gap-1 items-center justify-between  my-2">
            {game.event.resolved ? (
              <div className="text-2xl">
                Outcome: {game.event.outcome[0]}:{game.event.outcome[1]}
              </div>
            ) : (
              <Timer start={Number(new Date())} end={game.event.endDate} />
            )}
            <Typography className="text-xl truncate ...">
              {`${currency(stake)} Stake`}{' '}
            </Typography>
          </div>

          <div className="flex ">
            {game.participants.length > 0 && (
              <ParticipantTable game={game} stake={stake} />
            )}
            {usersBet ? (
              <div className="text-xl mt-4 ml-2">
                Your Bet: {usersBet[0]}:{usersBet[1]}
              </div>
            ) : (
              <button
                className="btn-casama py-2 px-6 text-xl"
                onClick={() => handleOpenBetNow()}
              >
                Bet Now
              </button>
            )}
          </div>
        </div>
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
