import { Stack, Typography, IconButton, Divider } from '@mui/material';
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

function ParticipantTable({ game, stake, user }) {
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
      <div className="text-gray-800 font-medium mt-3 ml-1 text-lg mb-1 ">
        Participants ({participants.length}) :
      </div>

      {participants.map((participant, i) => {
        return (
          <div
            key={`participant-${participant.address}`}
            className="flex flex-row w-full "
          >
            <div
              className={
                participant.address === user.address
                  ? `container-casama-p-0 px-4 flex flex-row items-center justify-between pl-2 my-1 w-full`
                  : `container-white-p-0 px-4 flex flex-row items-center justify-between pl-2 my-0.5 w-full`
              }
            >
              <div className=" flex flex-row justify-start w-5/6">
                <div className="flex ml-2">
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
  const { game, totalTokens, wunderPool, handleSuccess, user } = props;
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
      <div className="flex flex-col items-start gap-2  ">
        <div className="flex flex-row justify-between items-start w-full mb-3 sm:mb-0">
          <div className="flex flex-col sm:flex-row">
            <MdSportsSoccer className="text-5xl text-casama-blue w-full" />
            <IconButton
              className="container-round-transparent bg-white p-3 ml-0 sm:ml-2 mt-2 sm:mt-0"
              onClick={() =>
                handleShare(location.href, `Look at this Bet: `, handleSuccess)
              }
            >
              <ShareIcon className="text-casama-blue" />
            </IconButton>
          </div>
          <div className="flex flex-col container-white-p-0 p-2 px-4 text-right ">
            <Typography className="flex flex-row text-xl text-casama-light-blue justify-between truncate ...">
              <p>Stake:</p>
              <p className="ml-2">{`${currency(stake)}`}</p>
            </Typography>
            <Divider className="my-1" />
            <Typography className="flex flex-row text-xl font-semibold text-casama-blue justify-between truncate ...">
              <p>Pot:</p>
              <p className="ml-2">{` ${currency(
                stake * game.participants.length
              )} `}</p>
            </Typography>
          </div>
        </div>

        <div className="flex flex-col flex-1 gap 1  w-full">
          <Typography className="text-xl sm:text-2xl font-semibold text-gray-800 text-center my-1 sm:my-3">
            {game.event.name}
          </Typography>
          {console.log(game.event.outcome[0])}
          <div className="flex flex-row gap-1 items-center justify-center my-2 mb-4">
            {game.event.resolved ? (
              <div className="container-transparent-clean p-1 py-3  bg-casama-light text-white sm:w-4/5 w-full flex flex-col justify-center items-center">
                <p className="mb-4 sm:mb-5 pb-1 sm:pb-2 mt-1 text-xl sm:text-2xl font-medium border-b border-gray-400 w-11/12 text-center">
                  Result
                </p>
                <div className="flex flex-row justify-center items-center w-full mb-3">
                  <p className="w-5/12 text-center text-base sm:text-xl px-2 ">
                    {game.event.teams[0]}
                  </p>

                  <div className="w-2/12 flex flex-row justify-center ">
                    <p className="font-semibold text-xl sm:text-2xl">
                      {game.event.outcome[0]}
                    </p>
                    <p className="px-1 text-xl sm:text-2xl">:</p>
                    <p className="font-semibold text-xl sm:text-2xl">
                      {game.event.outcome[1]}
                    </p>
                  </div>
                  <p className="w-5/12 text-center text-base sm:text-xl px-2">
                    {game.event.teams[1]}
                  </p>
                </div>
              </div>
            ) : (
              <div className="container-transparent-clean p-1 py-5 sm:w-2/3 w-full bg-casama-light text-white 0 flex flex-col justify-center items-center">
                <Timer start={Number(new Date())} end={game.event.endDate} />
              </div>
            )}
          </div>

          {/* Only Show participants if user has voted */}
          {game.participants.find(
            (participant) => participant.address === user.address
          ) &&
            game.participants.length > 0 && (
              <ParticipantTable game={game} stake={stake} user={user} />
            )}

          {!usersBet && !game.event.resolved && (
            <button
              className="btn-casama py-2 px-6 mt-2"
              onClick={() => handleOpenBetNow()}
            >
              Bet Now
            </button>
          )}
        </div>
      </div>
      <PlaceBetDialog
        open={open}
        handleOpenBetNow={handleOpenBetNow}
        {...props}
      />
    </div>
  );
}
