import { Typography, IconButton, Divider, Chip } from '@mui/material';
import { useState, useEffect } from 'react';
import { MdSportsSoccer } from 'react-icons/md';
import { currency } from '../../../services/formatter';
import PayoutRuleInfoButton from '../../general/utils/payoutRuleInfoButton';
import Timer from '../../general/utils/timer';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '../../../services/shareLink';
import { addToWhiteListWithSecret } from '../../../services/contract/pools';
import TransactionDialog from '../../general/utils/transactionDialog';
import ParticipantTable, { PointsTable } from '../games/ParticipantTable';
import { useRef } from 'react';
import { HiArrowCircleRight } from 'react-icons/hi';
import { HiArrowCircleLeft } from 'react-icons/hi';
import { FormattedCompetition } from '../../../services/bettingHelpers';
import { UseNotification } from '../../../hooks/useNotification';
import { UseUserType } from '../../../hooks/useUser';
import axios from 'axios';

type DasboardMultiCompetitionCardProps = {
  competition: FormattedCompetition;
  handleSuccess: UseNotification.handleSuccess;
  user: UseUserType;
};

export default function DashboardCompetitionCard(
  props: DasboardMultiCompetitionCardProps
) {
  const { competition, handleSuccess, user } = props;
  const [inviteLink, setInviteLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [liveCompetition, setLiveCompetition] =
    useState<FormattedCompetition>();
  const scrollToRef = useRef(null);

  const { stake, sponsored, payoutRule, isPublic, maxMembers } =
    competition || {};

  const game = (liveCompetition || competition).games[index];

  const handleShareCompetition = () => {
    if (isPublic || inviteLink) {
      handleShare(
        inviteLink ||
          `${window.location.origin}/betting/join/${competition.competitionId}`,
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
        competition.games[0].event.chain,
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

  function handleChangeIndex(value) {
    if (index + value < 0) setIndex(competition.games.length - 1);
    else if (index + value > competition.games.length - 1) setIndex(0);
    else setIndex(index + value);
  }

  const isLive = game?.event?.startTime
    ? new Date(game.event.startTime) < new Date() &&
      new Date(game.event.endTime) > new Date()
    : false;
  const hasEnded = game?.event?.startTime
    ? new Date(game.event.startTime) < new Date() &&
      new Date(game.event.endTime) < new Date()
    : false;

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        axios({
          url: '/api/betting/competitions/show',
          params: { id: competition.competitionId },
        }).then(({ data }) => {
          setLiveCompetition(data);
        });
      }, 150000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [isLive]);

  return (
    <div className="container-gray w-full relative">
      <div ref={scrollToRef} className="absolute -top-16" />
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
              label={sponsored ? 'Free Roll' : isPublic ? 'Public' : 'Private'}
            />
            <Chip
              className="bg-casama-blue text-white w-full"
              size="medium"
              label={currency(
                sponsored
                  ? (stake / (maxMembers - 1)) * competition.members.length
                  : stake
              )}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 items-center justify-center my-2  ">
          <div className="w-full mb-5">
            <div className="flex flex-col container-white-p-0 p-2 px-4 text-right mb-2">
              <div className="flex flex-row text-left text-xl font-semibold text-casama-blue justify-center items-center underline truncate z-10 ...">
                <p className="mx-2">
                  {payoutRule == 'WINNER_TAKES_IT_ALL'
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
                <p className="ml-2">{`${competition.members.length}`}</p>
              </div>
            </div>
            <div className="flex flex-col container-white-p-0 p-2 px-4 text-right">
              <div className="flex flex-row text-xl text-casama-light-blue justify-between truncate ...">
                <p>Entry per match:</p>
                <p className="ml-2">{`${
                  sponsored
                    ? 'Free'
                    : currency(stake / competition.games.length)
                }`}</p>
              </div>
              <Divider className="my-1" />
              <div className="flex flex-row text-xl  text-casama-blue justify-between truncate ...">
                <p>Matches:</p>
                <p className="ml-2">{competition.games.length}</p>
              </div>
              <Divider className="my-1" />
              <div className="flex flex-row text-xl font-semibold text-casama-blue justify-between truncate ...">
                <p>Pot:</p>
                <p className="ml-2">
                  {currency(
                    (sponsored ? stake / (maxMembers - 1) : stake) *
                      competition.members.length
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-center justify-center my-2 mb-4 ">
          <div className="w-full mb-5">
            <div className="flex flex-col container-white-p-0 p-2 px-4 text-right mb-2">
              <div className="flex flex-row text-left text-xl font-semibold text-casama-blue justify-center items-center underline truncate z-10 ...">
                <p className="mx-2">Ranking</p>
              </div>
              <Divider className="my-1" />

              <div className="flex flex-row text-xl my-1 font-medium text-casama-light-blue truncate gap-5">
                <p className="flex-grow text-left">Name</p>
                <p>Points</p>
                <p>Payout</p>
              </div>
              <Divider className="my-1" />

              <PointsTable
                participants={(liveCompetition || competition).members}
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

        <div className="flex flex-row justify-between items-center text-center w-full">
          <div className="w-5/12">
            <img
              src={`/api/betting/events/teamImage?id=${game?.event.teamHome.id}`}
              className="w-16 mx-auto"
            />
          </div>
          <div className="my-2 sm:w-2/12 w-3/12">
            {isLive || hasEnded ? (
              <div className="shadow rounded-lg py-2 px-2 bg-casama-light text-white w-full">
                {isLive ? (
                  <div className="flex justify-end items-center gap-1 animate-pulse">
                    <div className="bg-red-500 w-2 h-2 rounded-full"></div>
                    <div className="text-sm">
                      {game?.event?.minute ? game?.event.minute : 'LIVE'}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">RESULT</div>
                )}

                <div className="flex justify-center gap-2 text-xl sm:text-3xl font-semibold">
                  <p>{game?.event?.outcome[0] || 0}</p>
                  <p>:</p>
                  <p>{game?.event?.outcome[1] || 0}</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="shadow rounded-lg py-2 px-2 w-full bg-casama-light text-white">
                  <Timer
                    start={Number(new Date())}
                    end={
                      new Date(game?.event?.startTime) > new Date()
                        ? game?.event?.startTime
                        : game?.event?.endTime
                    }
                    {...props}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="w-5/12">
            <img
              src={`/api/betting/events/teamImage?id=${game?.event.teamAway.id}`}
              className="w-16 mx-auto"
            />
          </div>
        </div>

        {/* NAMEN */}
        <div className="flex flex-row justify-between items-center text-center w-full">
          <div className="flex flex-row justify-center items-center text-center w-5/12">
            <p className="text-xl sm:text-2xl font-semibold">
              {game?.event.teamHome?.name || game?.event?.teamHome}
            </p>
          </div>
          <div className="flex sm:w-2/12 w-3/12"></div>
          <div className="flex flex-col justify-center items-center text-center w-5/12">
            <p className="text-xl sm:text-2xl font-semibold">
              {game?.event.teamAway?.name || game?.event?.teamAway}
            </p>
          </div>
        </div>
        <ParticipantTable
          participants={game?.participants}
          stake={sponsored ? 0 : stake}
          user={user}
        />
        <TransactionDialog open={loading} onClose={() => setLoading(false)} />
      </div>
    </div>
  );
}
