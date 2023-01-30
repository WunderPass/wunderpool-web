import { Typography, IconButton, Divider, Collapse, Chip } from '@mui/material';
import { useState, useEffect } from 'react';
import { MdSportsSoccer } from 'react-icons/md';
import { currency } from '/services/formatter';
import PayoutRuleInfoButton from '/components/general/utils/payoutRuleInfoButton';
import Timer from '/components/general/utils/timer';
import SoccerTimer from '/components/general/utils/soccerTimer';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '/services/shareLink';
import axios from 'axios';
import { calculateWinnings } from '/services/bettingHelpers';
import { addToWhiteListWithSecret } from '../../../services/contract/pools';
import TransactionDialog from '../../general/utils/transactionDialog';
import ParticipantTable, {
  ParticipantTableRow,
  PointsTable,
} from '../games/ParticipantTable';
import { compAddr, getNameFor } from '../../../services/memberHelpers';
import { IoIosArrowDown } from 'react-icons/io';
import { useRef } from 'react';
import { HiArrowCircleRight } from 'react-icons/hi';
import { HiArrowCircleLeft } from 'react-icons/hi';

export default function DashboardCompetitionCard(props) {
  const {
    competition,
    handleSuccess,
    handleError,
    user,
    isSortById,
    isHistory,
  } = props;
  const [liveCompetition, setLiveCompetition] = useState(null);
  const [gameResultTable, setGameResultTable] = useState([]);
  const [inviteLink, setInviteLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [reload, setReload] = useState(true);
  const [timerLoading, setTimerLoading] = useState(true);
  const scrollToRef = useRef(null);

  const { stake, sponsored, payoutRule, isPublic, maxMembers } =
    competition || {};

  const game = (liveCompetition || competition).games[0]; // Only assume Single Competitions as of now

  const isLive = game?.event?.startTime
    ? new Date(game.event.startTime) < new Date() &&
      new Date(game.event.endTime) > new Date()
    : false;

  const handleShareCompetition = () => {
    if (isPublic || inviteLink) {
      handleShare(
        inviteLink ||
          `${window.location.origin}/betting/join/${competition.id}`,
        `Join this Betting Competition`,
        handleSuccess
      );
    } else {
      setLoading(true);
      const secret = [...Array(33)]
        .map(() => (~~(Math.random() * 36)).toString(36))
        .join('');
      addToWhiteListWithSecret(
        competition.poolAddress,
        user.address,
        secret,
        50,
        7,
        () => {
          setInviteLink(
            `${window.location.origin}/betting/join/${competition.competitionId}?secret=${secret}`
          );
          setLoading(false);
          handleShare(
            `${window.location.origin}/betting/join/${competition.competitionId}?secret=${secret}`,
            `Join this Betting Competition`,
            handleSuccess
          );
        }
      );
    }
  };

  useEffect(() => {
    if (['RESOLVED', 'CLOSED_FOR_BETTING'].includes(game.event.state)) {
      setGameResultTable(
        calculateWinnings(
          game,
          sponsored ? stake / maxMembers : stake,
          game.event.outcome,
          payoutRule,
          sponsored
        )
      );
    } else {
      setGameResultTable(game.participants);
    }
  }, [game.event?.outcome]);

  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  function handleChangeIndex(value) {
    if (index + value < 0) setIndex(competition.games.length - 1);
    else if (index + value > competition.games.length - 1) setIndex(0);
    else setIndex(index + value);
  }

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        axios({
          url: '/api/betting/competitions/show',
          params: { id: competition.id },
        }).then(({ data }) => {
          if (data && data.games?.[0]) setLiveCompetition(data);
        });
      }, 150000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [isLive]);

  useEffect(() => {
    setIndex(index);
  }, [index]);

  return (
    <div className="container-gray w-full cursor-pointer relative">
      <div ref={scrollToRef} className="absolute -top-16" />

      <div>
        <div className="flex flex-col items-between gap-2 w-full">
          <div className="flex flex-row w-full">
            <div className="flex flex-col">
              <div className="flex flex-col h-full">
                <MdSportsSoccer className="text-4xl sm:text-5xl text-casama-blue" />
                <IconButton
                  className="container-round-transparent items-center justify-center bg-white p-2 sm:p-3 ml-0 mt-2 "
                  onClick={handleShareCompetition}
                >
                  <ShareIcon className="text-casama-blue sm:text-2xl text-lg" />
                </IconButton>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center w-full ">
              <Typography className="text-2xl sm:text-3xl font-bold mx-3 ml-8 sm:ml-0 text-gray-800 text-center my-1 sm:my-3 w-full">
                Combo Game
              </Typography>
              <Typography
                className="text-xl sm:text-3xl font-bold mx-3 ml-8 sm:ml-0 text-gray-800 text-center my-1 sm:my-3 w-full" //TODO only shows name for the whole competition from the first game in list
              >
                {competition.name}
              </Typography>
            </div>

            <div className="flex flex-col items-end gap-3">
              <Chip
                className={`${
                  sponsored ? 'bg-gold-shiny' : 'bg-white text-casama-blue'
                } w-full`}
                size="medium"
                label={
                  sponsored ? 'Free Roll' : isPublic ? 'Public' : 'Private'
                }
              />
              <Chip
                className="bg-casama-blue text-white w-full"
                size="medium"
                label={currency(
                  sponsored
                    ? (stake / (maxMembers - 1)) * game.participants.length
                    : stake
                )}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 items-center justify-center my-2  ">
            <div className="w-full sm:w-2/3 md:w-7/12 mb-5">
              <div
                togglable="false"
                className="flex flex-col container-white-p-0 p-2 px-4 text-right mb-2"
              >
                <div
                  togglable="false"
                  className="flex flex-row text-left text-xl font-semibold text-casama-blue justify-center items-center underline truncate z-10 ..."
                >
                  <p togglable="false" className="mx-2">
                    {payoutRule == 'WINNER_TAKES_IT_ALL'
                      ? 'Winner Takes It All'
                      : 'Proportional'}
                  </p>

                  <div togglable="false" className="mt-2">
                    <PayoutRuleInfoButton togglable="false" />
                  </div>
                </div>
                <Divider className="my-1" />

                <div className="flex flex-row text-xl text-casama-light-blue justify-between truncate ...">
                  <p>Participants:</p>
                  <p className="ml-2">{`${game.participants.length}`}</p>
                </div>
              </div>
              <div className="flex flex-col container-white-p-0 p-2 px-4 text-right">
                <div className="flex flex-row text-xl text-casama-light-blue justify-between truncate ...">
                  <p>Entry:</p>
                  <p className="ml-2">{`${
                    sponsored ? 'Free' : currency(stake)
                  }`}</p>
                </div>
                <Divider className="my-1" />
                <div className="flex flex-row text-xl font-semibold text-casama-blue justify-between truncate ...">
                  <p>Pot:</p>
                  <p className="ml-2">
                    {currency(
                      (sponsored ? stake / (maxMembers - 1) : stake) *
                        game.participants.length
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-center justify-center my-2 mb-4 ">
            <div className="w-full sm:w-2/3 md:w-7/12 mb-5">
              <div
                togglable="false"
                className="flex flex-col container-white-p-0 p-2 px-4 text-right mb-2"
              >
                <div
                  togglable="false"
                  className="flex flex-row text-left text-xl font-semibold text-casama-blue justify-center items-center underline truncate z-10 ..."
                >
                  <p togglable="false" className="mx-2">
                    Ranking
                  </p>
                </div>
                <Divider className="my-1" />

                <div className="flex flex-row text-xl my-1 font-medium text-casama-light-blue justify-between truncate ...">
                  <p>Name</p>

                  <p className="">Points</p>
                </div>
                <Divider className="my-1" />

                <PointsTable
                  competition={competition}
                  participants={game.participants}
                  stake={sponsored ? 0 : stake}
                  user={user}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center mx-5">
            <HiArrowCircleLeft
              onClick={() => handleChangeIndex(-1)}
              className="text-5xl text-casama-blue hover:text-casama-light-blue"
            />
            <div className="text-gray-500 font-xl">
              Match {index + 1} / {competition.games.length}
            </div>
            <HiArrowCircleRight
              onClick={() => handleChangeIndex(1)}
              className="text-5xl text-casama-blue hover:text-casama-light-blue"
            />
          </div>

          <>
            <div className="flex flex-col w-full mb-4 ">
              <div className="flex flex-col w-full mt-6">
                <div className="flex flex-col w-full justify-center items-center">
                  <div className="flex flex-col w-full ml-2">
                    {/* ICONS */}
                    <div className="flex flex-row justify-between items-center text-center w-full">
                      <div className="flex flex-col justify-center items-center text-center w-5/12">
                        <img
                          src={`/api/betting/events/teamImage?id=${competition.games[index]?.event.teamHome.id}`}
                          className="w-16 mb-2"
                        />
                      </div>
                      <div className="flex justify-center items-center my-2 sm:w-2/12 w-3/12">
                        {[
                          'RESOLVED',
                          'CLOSED_FOR_BETTING',
                          'HISTORIC',
                        ].includes(competition.games[index]?.state) ? ( //IF GAME started, or is finished
                          <div className="container-transparent-clean sm:pb-1 sm:pt-1.5 sm:px-5 pb-1 pt-2 px-4 bg-casama-light text-white  w-full flex flex-col justify-center items-center relative">
                            {isLive && (
                              <div className="flex justify-center items-center  ">
                                <div className="flex flex-row justify-center animate-pulse ">
                                  <div className="bg-red-500 w-2 h-2 rounded-full"></div>
                                  <div className="text-sm">
                                    {competition.games[index]?.event?.minute
                                      ? competition.games[index]?.event.minute
                                      : 'LIVE'}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-row justify-center items-center my-2">
                              <div className=" flex flex-row justify-center text-xl sm:text-3xl">
                                <p className="font-semibold ">
                                  {competition.games[index]?.event
                                    ?.outcome[0] || 0}
                                </p>
                                <p className="px-2  "> : </p>
                                <p className="font-semibold ">
                                  {competition.games[index]?.event
                                    ?.outcome[1] || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          //IF GAME is upcoming
                          //TODO CHECK IF THIS SCOPE IS USELESS?
                          <div className={timerLoading ? 'invisible' : ''}>
                            <div className="container-transparent-clean p-1 py-5 pb-1 pt-2 px-4 w-full bg-casama-light text-white flex-col justify-center items-center ">
                              {new Date(
                                competition.games[index]?.event.startTime
                              ) < new Date() && (
                                <div className="flex justify-center items-center gap-1 ">
                                  <div className="flex flex-row justify-center animate-pulse ">
                                    <div className="bg-red-500 w-2 h-2 rounded-full"></div>
                                    <div className="text-sm">LIVE</div>
                                  </div>
                                </div>
                              )}

                              <Timer
                                start={Number(new Date())}
                                end={
                                  new Date(
                                    competition.games[index]?.event?.startTime
                                  ) > new Date()
                                    ? competition.games[index]?.event?.startTime
                                    : competition.games[index]?.event?.endTime
                                }
                                setTimerLoading={setTimerLoading}
                                {...props}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center items-center text-center w-5/12">
                        <img
                          src={`/api/betting/events/teamImage?id=${competition.games[index]?.event.teamAway.id}`}
                          className="w-16 mb-2"
                        />
                      </div>
                    </div>

                    {/* NAMEN */}
                    <div className="flex flex-row justify-between items-center text-center mb-2 w-full">
                      <div className="flex flex-row justify-center items-center text-center w-5/12">
                        <p className="text-xl sm:text-2xl font-semibold">
                          {competition.games[index]?.event.teamHome?.name ||
                            competition.games[index]?.event?.teamHome}
                        </p>
                      </div>
                      <div className="flex sm:w-2/12 w-3/12"></div>
                      <div className="flex flex-col justify-center items-center text-center w-5/12">
                        <p className="text-xl sm:text-2xl font-semibold">
                          {competition.games[index]?.event.teamAway?.name ||
                            competition.games[index]?.event?.teamAway}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <ParticipantTable
                    participants={competition.games[index]?.participants}
                    stake={sponsored ? 0 : stake}
                    user={user}
                  />
                </div>
                <TransactionDialog
                  open={loading}
                  onClose={() => setLoading(false)}
                />
              </div>
            </div>
          </>
        </div>
      </div>
    </div>
  );
}
