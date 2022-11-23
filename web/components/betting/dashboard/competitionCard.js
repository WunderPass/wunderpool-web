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
} from '../games/ParticipantTable';
import { compAddr, getNameFor } from '../../../services/memberHelpers';
import { IoIosArrowDown } from 'react-icons/io';
import { useRef } from 'react';

export default function DashboardCompetitionCard(props) {
  const {
    competition,
    handleSuccess,
    handleError,
    user,
    isSortById,
    isHistory,
  } = props;
  const [showDetails, setShowDetails] = useState(false);
  const [liveCompetition, setLiveCompetition] = useState(null);
  const [gameResultTable, setGameResultTable] = useState([]);
  const [inviteLink, setInviteLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollToRef = useRef(null);
  const stake = competition.stake;
  const game = (liveCompetition || competition).games[0]; // Only assume Single Competitions as of now
  const isLive = game?.event?.startTime
    ? new Date(game.event.startTime) < new Date() &&
      new Date(game.event.endTime) > new Date()
    : false;

  const handleShareCompetition = () => {
    if (competition.isPublic || inviteLink) {
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
            `${window.location.origin}/betting/join/${competition.id}?secret=${secret}`
          );
          setLoading(false);
          handleShare(
            `${window.location.origin}/betting/join/${competition.id}?secret=${secret}`,
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
          competition.stake,
          game.event.outcome,
          competition.payoutRule
        )
      );
    } else {
      setGameResultTable(game.participants);
    }
  }, [game.event?.outcome]);

  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  const handleToggle = (e) => {
    if (e.target.getAttribute('togglable') == 'false') return;
    setShowDetails(!showDetails);
    scrollToRef.current.scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (!isSortById) return;
    setShowDetails(true);
  }, [isSortById]);

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

  return (
    <div className="container-gray pb-16 w-full cursor-pointer relative">
      <div ref={scrollToRef} className="absolute -top-16" />
      <div onClick={handleToggle}>
        <div className="flex flex-col items-between gap-2 w-full onClick={() => setShowDetails(true)} ">
          <div className="flex flex-row w-full mb-4 ">
            <div className="flex flex-col">
              <div className="flex flex-col h-full ">
                <MdSportsSoccer className="text-4xl sm:text-5xl text-casama-blue " />
                <IconButton
                  className="container-round-transparent items-center justify-center bg-white p-2 sm:p-3 ml-0 mt-2 "
                  onClick={handleShareCompetition}
                >
                  <ShareIcon className="text-casama-blue sm:text-2xl text-lg" />
                </IconButton>
              </div>
            </div>
            <Typography className="text-2xl sm:text-3xl font-bold mx-3 ml-8 sm:ml-0  text-gray-800 text-center my-1 sm:my-3 w-full">
              {game.event.shortName}
            </Typography>

            <div className="flex flex-col items-end gap-3">
              <Chip
                className="bg-white text-casama-blue w-full"
                size="medium"
                label={competition.isPublic ? 'Public' : 'Private'}
              />
              <Chip
                className="bg-casama-blue text-white w-full"
                size="medium"
                label={currency(competition.stake)}
              />
            </div>
          </div>
          <div className="flex flex-col w-full  ">
            <div className="flex flex-col w-full justify-center items-center">
              <div className="flex flex-col w-full ml-2">
                {/* ICONS */}
                <div className="flex flex-row justify-between items-center text-center w-full">
                  <div className="flex flex-col justify-center items-center text-center w-5/12 ">
                    <img
                      src={`/api/betting/events/teamImage?id=${game.event.teamHome.id}`}
                      className="w-16 mb-2"
                    />
                  </div>
                  <p className="text-3xl font-semibold">vs</p>
                  <div className="flex flex-col justify-center items-center text-center w-5/12 ">
                    <img
                      src={`/api/betting/events/teamImage?id=${game.event.teamAway.id}`}
                      className="w-16 mb-2"
                    />
                  </div>
                </div>

                {/* NAMEN */}
                <div className="flex flex-row justify-between items-center text-center mb-2 w-full ">
                  <div className="flex flex-row justify-center items-center text-center w-5/12 ">
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
            </div>

            <Collapse in={!showDetails}>
              <ParticipantTableRow
                user={user}
                address={'Your Bet'}
                wunderId={user.wunderId}
                userName={user.userName}
                profileName={getNameFor(user)}
                prediction={
                  gameResultTable.find((p) => compAddr(p.address, user.address))
                    ?.prediction
                }
                winnings={
                  gameResultTable.find((p) => compAddr(p.address, user.address))
                    ?.winnings
                }
                stake={stake}
              />
            </Collapse>
            <Collapse in={showDetails}>
              <div className="flex flex-col gap-1 items-center justify-center my-2 mb-4 mt-6">
                <div className="w-full sm:w-2/3 md:w-7/12 mb-5">
                  <div
                    togglable="false"
                    className="flex flex-col container-white-p-0 p-2 px-4 text-right mb-2"
                  >
                    <div
                      togglable="false"
                      className="flex flex-row text-left text-xl font-semibold text-casama-blue justify-center items-center underline truncate z-10 ..."
                    >
                      <p togglable="false" className="mx-2 ">
                        {competition.payoutRule == 'WINNER_TAKES_IT_ALL'
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

                {['RESOLVED', 'CLOSED_FOR_BETTING'].includes(
                  game.event.state
                ) ? (
                  <div className="container-transparent-clean p-1 py-3  bg-casama-light text-white sm:w-4/5 w-full flex flex-col justify-center items-center relative">
                    {isLive && (
                      <div className="absolute top-3 right-5 flex items-center gap-1 animate-pulse">
                        <div className="bg-red-500 w-2 h-2 rounded-full"></div>
                        <div className="text-sm">LIVE</div>
                      </div>
                    )}
                    <p className="mb-4 sm:mb-5 pb-1 sm:pb-2 mt-1 text-xl sm:text-2xl font-medium border-b border-gray-400 w-11/12 text-center">
                      Result
                    </p>
                    <div className="flex flex-row justify-center items-center w-full mb-3">
                      <p className="w-5/12 text-center text-base sm:text-xl px-2 ">
                        {game.event.teamHome.name}
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
                        {game.event.teamAway.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="container-transparent-clean p-1 py-5 sm:w-2/3 w-full bg-casama-light text-white 0 flex flex-col justify-center items-center relative">
                    {new Date(game.event.startTime) < new Date() && (
                      <div className="absolute top-2 right-3 flex items-center gap-1 ">
                        {/* <div>
                        <SoccerTimer
                          start={Number(new Date())}
                          end={Number(addMinutes(new Date(), 90))}
                        />
                        {console.log(new Date())}
                        {console.log(addMinutes(new Date(), 90))}
                      </div> */}

                        <div className="flex flex-row animate-pulse">
                          <div className="bg-red-500 w-2 h-2 rounded-full"></div>
                          <div className="text-sm">LIVE</div>
                        </div>
                      </div>
                    )}
                    <Timer
                      start={Number(new Date())}
                      end={
                        new Date(game.event.startTime) > new Date()
                          ? game.event.startTime
                          : game.event.endTime
                      }
                      size="large"
                    />
                  </div>
                )}
              </div>
              {showDetails && (
                <ParticipantTable
                  participants={gameResultTable}
                  stake={stake}
                  user={user}
                />
              )}
            </Collapse>
            <div className="flex justify-center text-3xl text-casama-blue">
              <div
                className={`transition-transform ${
                  showDetails ? 'rotate-180' : ''
                }`}
              >
                <IoIosArrowDown />
              </div>
            </div>
            <TransactionDialog
              open={loading}
              onClose={() => setLoading(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
