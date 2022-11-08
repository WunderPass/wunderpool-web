import { Typography, IconButton, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { MdSportsSoccer } from 'react-icons/md';
import { currency } from '/services/formatter';
import PayoutRuleInfoButton from '/components/general/utils/payoutRuleInfoButton';
import Avatar from '/components/general/members/avatar';
import Timer from '/components/betting/proposals/timer';
import { useRouter } from 'next/router';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '/services/shareLink';
import { getEnsNameFromAddress } from '/services/memberHelpers';
import { compAddr } from '../../../services/memberHelpers';

function ParticipantTable({ game, stake, user }) {
  const { participants, event } = game;

  return (
    <div className="">
      {participants.length > 0 && (
        <div className="text-gray-800 font-medium mt-3 ml-1 text-lg mb-1 ">
          Participants :
        </div>
      )}

      {participants.map((participant, i) => {
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
                <div className="flex items-center justify-start ml-2 wtext-ellipsis overflow-hidden mr-4 ...">
                  {participant.wunderId ? (
                    <div className="truncate ...">{participant.wunderId}</div>
                  ) : (
                    <div className="truncate ...">{participant.address}</div>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-end items-center py-3 w-full text-xl">
                <p>{participant.prediction[0]}</p>
                <p className="px-1">:</p>
                <p>{participant.prediction[1]}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashBoardGameCard(props) {
  const { game, handleSuccess, user } = props;
  const router = useRouter();
  const stake = game.stake / 1000000; //TODO

  return (
    <div className="container-gray pb-16 w-full">
      <div className="flex flex-col items-start gap-2  w-full">
        <div className="flex flex-row justify-center items-start w-full mb-4">
          <div className="flex flex-col justify-start items-start">
            <div className="flex flex-col justify-start items-start ">
              <MdSportsSoccer className="text-4xl sm:text-5xl text-casama-blue " />
              <IconButton
                className="container-round-transparent items-center justify-center bg-white p-2 sm:p-3 ml-0 mt-2 "
                onClick={() =>
                  handleShare(
                    'https://app.casama.io/betting/pools/join/' + game.id,
                    `Look at this Bet: `,
                    handleSuccess
                  )
                }
              >
                <ShareIcon className="text-casama-blue sm:text-2xl text-lg" />
              </IconButton>
            </div>
          </div>
          <Typography className="text-xl sm:text-3xl font-bold mx-3 text-gray-800 text-center my-1 sm:my-3 w-full ml-2">
            {game.event.shortName}
          </Typography>
        </div>

        <div className="flex flex-col w-full ">
          <div className="flex flex-col w-full justify-center items-center mb-5 ">
            <div className="flex flex-col w-full ml-2">
              {/* ICONS */}
              <div className="flex flex-row justify-between items-center text-center w-full">
                <div className="flex flex-col justify-center items-center text-center w-5/12 ">
                  <img
                    src={`/api/betting/events/teamImage?id=${game.event.teamHome.id}`}
                    className="w-16 mb-2"
                  />
                </div>
                <div className="flex flex-col justify-center items-center text-center w-5/12 ">
                  <img
                    src={`/api/betting/events/teamImage?id=${game.event.teamAway.id}`}
                    className="w-16 mb-2"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-lg sm:text-xl font-semibold">vs</p>
              </div>

              {/* NAMEN */}
              <div className="flex flex-row justify-between items-center text-center mb-8 w-full">
                <div className="flex flex-col justify-center items-center text-center w-5/12 ">
                  <p className="text-xl sm:text-2xl font-semibold ">
                    {game.event.teamHome?.name || game.event?.teamHome}
                  </p>
                </div>
                <div className="flex flex-col justify-center items-center text-center w-5/12 ">
                  <p className="text-xl sm:text-2xl font-semibold ">
                    {game.event.teamAway?.name || game.event?.teamAway}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-2/3 md:w-7/12 ">
              <div className="flex flex-col container-white-p-0 p-2 px-4 text-right mb-2">
                <div className="flex flex-row text-left text-xl font-semibold text-casama-blue justify-center items-center underline truncate ...">
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

                <div className="flex flex-row text-xl text-casama-light-blue justify-between truncate ...">
                  <p>Participants:</p>
                  <p className="ml-2">{`${game.participants.length}`}</p>
                </div>
              </div>
              <div className="flex flex-col container-white-p-0 p-2 px-4 text-right ">
                <div className="flex flex-row text-xl text-casama-light-blue justify-between truncate ...">
                  <p>Entry:</p>
                  <p className="ml-2">{`${currency(stake)}`}</p>
                </div>
                <Divider className="my-1" />
                <div className="flex flex-row text-xl font-semibold text-casama-blue justify-between truncate ...">
                  <p>Pot:</p>
                  <p className="ml-2">{` ${currency(
                    stake * game.participants.length
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
                    {game.event.teamHome?.name || game.event.teamHome}
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
                    {game.event.teamAway?.name || game.event.teamAway}
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
          {user &&
            (game.event.state == 'RESOLVED' ||
              (game.participants.find((participant) =>
                compAddr(participant.address, user.address)
              ) && <ParticipantTable game={game} stake={stake} user={user} />))}
        </div>
      </div>
    </div>
  );
}
