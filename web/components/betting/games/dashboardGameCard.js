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
  const { bettingGame, handleSuccess, user } = props;
  const router = useRouter();

  const stake = bettingGame.stake / 951000; //TODO

  const usersBet = bettingGame.participants.find(
    (p) => p.address.toLowerCase() == user.address.toLowerCase()
  )?.prediction;

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
            {bettingGame.name}
          </Typography>
        </div>

        <div className="flex flex-col w-full ">
          <div className="flex flex-col w-full justify-center items-center mb-5 ">
            <div className="w-full sm:w-2/3 md:w-7/12">
              <div className="flex flex-col container-white-p-0 p-2 px-4 text-right mb-2">
                <div className="flex flex-row text-left text-xl font-semibold text-casama-blue justify-center items-center underline truncate ...">
                  <p className="mx-2 ">
                    {bettingGame.payoutRule == 0
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
                  <p className="ml-2">{`${bettingGame.participants.length}`}</p>
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
                    stake * bettingGame.participants.length
                  )} `}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-1 items-center justify-center my-2 mb-4">
            <div className="container-transparent-clean p-1 py-5 sm:w-2/3 w-full bg-casama-light text-white 0 flex flex-col justify-center items-center">
              <Timer
                start={Number(new Date())}
                end={bettingGame.event.startTime || bettingGame.event.endTime}
                w
              />
            </div>
          </div>

          {<ParticipantTable game={bettingGame} stake={stake} user={user} />}
        </div>
      </div>
    </div>
  );
}
