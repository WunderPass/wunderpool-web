import { Stack, Typography, IconButton, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { MdSportsSoccer } from 'react-icons/md';
import { currency } from '/services/formatter';
import PayoutRuleInfoButton from '/components/general/utils/payoutRuleInfoButton';
import Avatar from '/components/general/members/avatar';
import Timer from '/components/general/utils/timer';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '/services/shareLink';
import { getEnsNameFromAddress } from '/services/memberHelpers';
import { compAddr } from '../../../services/memberHelpers';
import { calculateWinnings } from '/services/bettingHelpers';

function ParticipantTable({ user, participants, stake }) {
  return (
    <div className="">
      {participants.length > 0 && (
        <div className="text-gray-800 font-medium mt-3 ml-1 text-lg mb-1 ">
          Participants :
        </div>
      )}

      {participants
        .sort((a, b) => b.winnings || 0 - a.winnings || 0)
        .map((participant, i) => {
          return (
            <div
              key={`participant-${participant.address}`}
              className="flex flex-row w-full "
            >
              <div
                className={
                  compAddr(participant.address, user.address)
                    ? `container-casama-p-0 px-4 flex flex-row items-center justify-between pl-2 my-1 w-full`
                    : `container-white-p-0 px-4 flex flex-row items-center justify-between pl-2 my-0.5 w-full`
                }
              >
                <div className=" flex flex-row justify-start w-5/6">
                  <div className="flex ml-2">
                    <Avatar
                      shiftRight
                      wunderId={participant.wunderId}
                      tooltip={`${participant.wunderId}`}
                      text={participant.wunderId ? participant.wunderId : '0-X'}
                      color={['green', 'blue', 'red'][i % 3]}
                      i={i}
                    />
                  </div>

                  {/* TODO {getEnsNameFromAddress(participant.address).then((name) =>
                  console.log('name', name)
                )} */}
                  <div className="flex items-center justify-start ml-2 wtext-ellipsis overflow-hidden mr-4">
                    {participant.wunderId ? (
                      <div className="truncate">{participant.wunderId}</div>
                    ) : (
                      <div className="truncate">{participant.address}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row justify-end items-center py-3 w-full text-xl">
                  <p>{participant.prediction[0]}</p>
                  <p className="px-1">:</p>
                  <p>{participant.prediction[1]}</p>
                </div>
                {participant.winnings != undefined && (
                  <div className="py-3 ml-4">
                    {participant.winnings >= stake ? (
                      <p className="text-green-500 text-xl">
                        {currency(participant.winnings - stake)}
                      </p>
                    ) : (
                      <p className="text-red-500 text-xl">
                        {currency(stake - participant.winnings)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default function CompetitionCard(props) {
  const { competition, totalTokens, wunderPool, handleSuccess, user } = props;
  const game = competition.games[0]; // Only assume Single Competitions as of now
  const [open, setOpen] = useState(false);
  const [gameResultTable, setGameResultTable] = useState([]);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const router = useRouter();

  const usersBet = game.participants.find((p) =>
    compAddr(p.address, wunderPool.userAddress)
  )?.prediction;

  const handleOpenBetNow = (onlyClose = false) => {
    if (onlyClose && !open) return;
    if (open) {
      setOpen(false);
      goBack(() => removeQueryParam('bet'));
    } else {
      addQueryParam({ bet: game.id }, false);
    }
  };

  useEffect(() => {
    if (!game.event?.outcome || game.event.outcome.length == 0) {
      setGameResultTable(game.participants);
    } else {
      setGameResultTable(
        calculateWinnings(
          game,
          competition.stake,
          game.event.outcome,
          competition.payoutRule
        )
      );
    }
  }, [game.event?.outcome]);

  useEffect(() => {
    setOpen(router.query.bet == game.id);
  }, [router.query]);

  return (
    <div className="container-gray pb-16 ">
      <div className="flex flex-col items-start gap-2  ">
        <div className="flex flex-row justify-center items-start w-full mb-4">
          <div className="flex flex-col justify-start items-start">
            <div className="flex flex-col justify-start items-start ">
              <MdSportsSoccer className="text-4xl sm:text-5xl text-casama-blue " />
              <IconButton
                className="container-round-transparent items-center justify-center bg-white p-2 sm:p-3 ml-0 mt-2 "
                onClick={() =>
                  handleShare(
                    location.href,
                    `Look at this Bet: `,
                    handleSuccess
                  )
                }
              >
                <ShareIcon className="text-casama-blue sm:text-2xl text-lg" />
              </IconButton>
            </div>
          </div>
          <Typography className="text-xl  sm:text-3xl font-bold mx-3 text-gray-800 text-center my-1 sm:my-3 w-full mr-12 sm:mr-14 ">
            {game.event?.name}
          </Typography>
        </div>

        <div className="flex flex-col w-full ">
          <div className="flex flex-col w-full justify-center items-center mb-5 ">
            <div className="w-full sm:w-2/3 md:w-7/12">
              <div className="flex flex-col container-white-p-0 p-2 px-4 text-right mb-2">
                <div className="flex flex-row text-left text-xl font-semibold text-casama-blue justify-center items-center underline truncate">
                  <p className="mx-2 ">
                    {game.payoutRule == 0
                      ? 'Winner Takes It All'
                      : 'Proportional'}
                  </p>

                  <div className="mt-2">
                    <PayoutRuleInfoButton />
                  </div>
                </div>
                <Divider className="my-1" />

                <div className="flex flex-row text-xl text-casama-light-blue justify-between truncate">
                  <p>Participants:</p>
                  <p className="ml-2">{`${game.participants.length}`}</p>
                </div>
              </div>
              <div className="flex flex-col container-white-p-0 p-2 px-4 text-right ">
                <div className="flex flex-row text-xl text-casama-light-blue justify-between truncate">
                  <p>Entry:</p>
                  <p className="ml-2">{`${currency(competition.stake)}`}</p>
                </div>
                <Divider className="my-1" />
                <div className="flex flex-row text-xl font-semibold text-casama-blue justify-between truncate">
                  <p>Pot:</p>
                  <p className="ml-2">{` ${currency(
                    competition.stake * game.participants.length
                  )} `}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-1 items-center justify-center my-2 mb-4">
            {game.event.state == 'RESOLVED' ? (
              <div className="container-transparent-clean p-1 py-3  bg-casama-light text-white sm:w-4/5 w-full flex flex-col justify-center items-center">
                <p className="mb-4 sm:mb-5 pb-1 sm:pb-2 mt-1 text-xl sm:text-2xl font-medium border-b border-gray-400 w-11/12 text-center">
                  Result
                </p>
                <div className="flex flex-row justify-center items-center w-full mb-3">
                  <p className="w-5/12 text-center text-base sm:text-xl px-2 ">
                    {game.event.teamHome?.name}
                  </p>

                  <div className="w-2/12 flex flex-row justify-center ">
                    <p className="font-semibold text-xl sm:text-2xl">
                      {game.event?.outcome[0] || 0}
                    </p>
                    <p className="px-1 text-xl sm:text-2xl">:</p>
                    <p className="font-semibold text-xl sm:text-2xl">
                      {game.event?.outcome[1] || 0}
                    </p>
                  </div>
                  <p className="w-5/12 text-center text-base sm:text-xl px-2">
                    {game.event.teamAway?.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="container-transparent-clean p-1 py-5 sm:w-2/3 w-full bg-casama-light text-white 0 flex flex-col justify-center items-center relative">
                {new Date(game.event.startTime) < new Date() && (
                  <div className="absolute top-2 right-3 flex items-center gap-1 animate-pulse">
                    <div className="bg-red-500 w-2 h-2 rounded-full"></div>
                    <div className="text-sm">LIVE</div>
                  </div>
                )}
                <Timer
                  start={Number(new Date())}
                  end={
                    new Date(game.event.startTime) > new Date()
                      ? game.event.startTime
                      : game.event.endTime
                  }
                />
              </div>
            )}
          </div>

          {/* Only Show participants if user has voted */}
          {game.event.state == 'RESOLVED' ||
            (game.participants.find((participant) =>
              compAddr(participant.address, user.address)
            ) && (
              <ParticipantTable
                user={user}
                participants={gameResultTable}
                stake={competition.stake}
              />
            ))}
          {wunderPool.isMember &&
            !usersBet &&
            game.event.state != 'RESOLVED' &&
            new Date(game.event.startTime) > new Date() && (
              <div className="flex justify-center items-center">
                <button
                  className="btn-casama py-3 sm:mt-4 mt-2 sm:w-2/3 w-full "
                  onClick={() => handleOpenBetNow()}
                >
                  Place your Bet
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
