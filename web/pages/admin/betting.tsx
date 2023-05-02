import {
  Collapse,
  Container,
  Divider,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { registerEvent } from '../../services/contract/betting/events';
import { MdSportsSoccer } from 'react-icons/md';
import { IoIosArrowDown, IoMdRefresh } from 'react-icons/io';
import { AiFillUpCircle, AiOutlineDownCircle } from 'react-icons/ai';
import Link from 'next/link';
import { resolveEvent } from '../../services/contract/betting/events';
import { pluralize } from '../../services/formatter';
import { BiMailSend } from 'react-icons/bi';
import fs from 'fs';
import ParticipantTable from '../../components/betting/games/ParticipantTable';
import {
  calculateWinnings,
  FormattedCompetition,
  FormattedEvent,
} from '../../services/bettingHelpers';
import { FiShare } from 'react-icons/fi';
import ShareCompetitionCard from '../../components/betting/dashboard/shareCompetitionCard';
import { sortByStartTime } from '../../services/sortingFunctions';
import { UseUserType } from '../../hooks/useUser';
import { UseNotification } from '../../hooks/useNotification';
import { SupportedChain } from '../../services/contract/types';

type TimeFrameProps = {
  start: Date;
  end: Date;
};

function TimeFrame({ start, end }: TimeFrameProps) {
  const startHour = String(start.getHours()).padStart(2, '0');
  const startMinute = String(start.getMinutes()).padStart(2, '0');
  const endHour = String(end.getHours()).padStart(2, '0');
  const endMinute = String(end.getMinutes()).padStart(2, '0');
  const isSameDay = start.toLocaleDateString() == end.toLocaleDateString();

  if (isSameDay) {
    return (
      <Typography>{`${start.toLocaleDateString()} ${startHour}:${startMinute} - ${endHour}:${endMinute}`}</Typography>
    );
  }
  return (
    <Typography>
      {`${start.toLocaleDateString()} ${startHour}:${startMinute} - ${endHour}:${endMinute}`}
      &#8314;&#185;
    </Typography>
  );
}

type ToggleButtonProps = {
  state: boolean;
  setState: Dispatch<SetStateAction<boolean>>;
};

function ToggleButton({ state, setState }: ToggleButtonProps) {
  return (
    <button onClick={() => setState((st) => !st)}>
      {state ? (
        <AiFillUpCircle className="text-casama-blue text-2xl" />
      ) : (
        <AiOutlineDownCircle className="text-casama-blue text-2xl" />
      )}
    </button>
  );
}

type EventCardProps = {
  event: FormattedEvent;
  competitions: FormattedCompetition[];
  fetchEvents: (fetchListed?: boolean) => void;
  fetchCompetitions: () => void;
  handleSuccess: UseNotification.handleSuccess;
  handleError: UseNotification.handleError;
  user: UseUserType;
};

function EventCard({
  event,
  competitions,
  fetchEvents,
  fetchCompetitions,
  handleSuccess,
  handleError,
  user,
}: EventCardProps) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [loading, setLoading] = useState(false);

  const settleAllGames = async () => {
    return (
      await Promise.all(
        competitions.map(async (comp) => {
          return await Promise.all(
            comp.games
              .filter((g) => g.event.id == event.id)
              .map(async (g) => {
                try {
                  await axios({
                    method: 'POST',
                    url: '/api/betting/games/close',
                    data: { competitionId: comp.competitionId, gameId: g.id },
                  });
                  return true;
                } catch (error) {
                  return false;
                }
              })
          );
        })
      )
    ).flat();
  };

  const handleResolve = () => {
    setLoading(true);
    resolveEvent(event.id, Number(homeScore), Number(awayScore))
      .then((res) => {
        handleSuccess(`Resolved Event "${event.name}"`);
        fetchEvents(false);
        fetchCompetitions();
      })
      .catch((err) => {
        handleError(err, user.wunderId, user.userName);
      })
      .then(() => {
        settleAllGames()
          .then((res) => {
            handleSuccess(
              `Settled ${res.filter((b) => b).length}/${
                competitions.length
              } Games`
            );
          })
          .catch((err) => {
            handleError(err, user.wunderId, user.userName);
          })
          .then(() => {
            setLoading(false);
          });
      });
  };

  return (
    <Paper className="p-3 my-2 rounded-xl relative">
      {competitions.length > 0 && (
        <p className="absolute top-3 right-3 text-lg flex items-center justify-center font-medium px-2 min-w-[2.5rem] h-6 rounded-full bg-red-500 text-white">
          {competitions.length}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <MdSportsSoccer className="text-5xl text-casama-blue" />
        <div className="flex-grow flex flex-col gap-2 w-full">
          <p className="text-lg font-medium sm:mr-10">{event.name}</p>
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <TimeFrame
              start={new Date(event.startTime)}
              end={new Date(event.endTime)}
            />
            {event.state != 'RESOLVED' && (
              <div className="flex self-end gap-1">
                <div className="w-20">
                  <input
                    disabled={loading}
                    inputMode="numeric"
                    className="textfield text-center py-1 px-3"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                  />
                </div>
                :
                <div className="w-20">
                  <input
                    disabled={loading}
                    inputMode="numeric"
                    className="textfield text-center py-1 px-3"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                  />
                </div>
                <button
                  className="btn-casama py-1 px-2 w-full sm:w-auto"
                  onClick={handleResolve}
                  disabled={
                    !homeScore ||
                    !awayScore ||
                    loading ||
                    Number(event.endTime) > Number(new Date())
                  }
                >
                  Resolve & Settle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Paper>
  );
}

type ListedEventCardProps = {
  event: FormattedEvent;
  fetchEvents: (fetchListed?: boolean) => void;
  handleSuccess: UseNotification.handleSuccess;
  handleError: UseNotification.handleError;
  removeListedEvent: (eventId: number) => void;
  user: UseUserType;
  chain: SupportedChain;
};

function ListedEventCard({
  event,
  fetchEvents,
  handleSuccess,
  handleError,
  removeListedEvent,
  user,
  chain,
}: ListedEventCardProps) {
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setLoading(true);
    registerEvent(event.id, chain)
      .then((res) => {
        handleSuccess(`Created Event "${event.name}"`);
        fetchEvents(false);
        setLoading(false);
        removeListedEvent(event.id);
      })
      .catch((err) => {
        handleError(err, user.wunderId, user.userName);
        setLoading(false);
      });
  };

  return (
    <Paper className="p-3 my-2 rounded-xl">
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
        <MdSportsSoccer className="text-5xl text-casama-blue" />
        <div className="flex-grow flex flex-col gap-2 w-full">
          <div className="w-full flex items-start justify-between gap-2">
            <p className="text-lg font-medium">{event.name}</p>
          </div>
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <TimeFrame
              start={new Date(event.startTime)}
              end={new Date(event.endTime)}
            />
            <button
              className="btn-casama py-1 px-2 w-full sm:w-auto"
              onClick={handleCreate}
              disabled={loading}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </Paper>
  );
}

type CompetitionCardProps = {
  competition: FormattedCompetition;
  fetchCompetitions: () => void;
  handleSuccess: UseNotification.handleSuccess;
  handleError: UseNotification.handleError;
  user: UseUserType;
};

function CompetitionCard({
  competition,
  fetchCompetitions,
  handleSuccess,
  handleError,
  user,
}: CompetitionCardProps) {
  const [loading, setLoading] = useState(false);

  const handleClose = (gameId) => {
    setLoading(true);
    axios({
      method: 'POST',
      url: '/api/betting/games/close',
      data: { competitionId: competition.competitionId, gameId },
    })
      .then((res) => {
        handleSuccess(`Closed Game "${competition.name}"`);
        fetchCompetitions();
      })
      .catch((err) => {
        handleError(err, user.wunderId, user.userName);
      })
      .then(() => setLoading(false));
  };

  return (
    <Paper className="p-3 my-2 rounded-xl relative">
      {competition.members.length > 0 && (
        <p className="absolute top-3 right-3 text-lg flex items-center justify-center font-medium px-2 min-w-[2.5rem] h-6 rounded-full bg-red-500 text-white">
          {competition.members.length}
        </p>
      )}
      <Link href={`/betting/${competition.poolAddress}`}>
        <a className="text-lg font-medium">{competition.name}</a>
      </Link>
      {competition.games.map((game) => {
        return (
          <div
            key={`game-${competition.competitionId}-${game.id}`}
            className="flex flex-col sm:flex-row items-center gap-2 w-full"
          >
            <MdSportsSoccer className="text-5xl text-casama-blue" />
            <div className="flex-grow flex flex-col w-full">
              <div className="sm:mr-10">
                <p className="text-casama-blue">{game.event?.shortName}</p>
                <p>
                  Status: {game.state} / {game.event.state}
                </p>
              </div>
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <p>Stake: {competition.stake} $</p>
                {game.state != 'HISTORIC' && (
                  <button
                    className="btn-casama py-1 px-2 w-full sm:w-auto"
                    onClick={() => handleClose(game.id)}
                    disabled={
                      loading ||
                      ['IMPORTED', 'SETTLED'].includes(game.event?.state)
                    }
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </Paper>
  );
}

type ClosedCompetitionCardProps = {
  competition: FormattedCompetition;
  notifiedCompetitions: number[];
  handleSuccess: UseNotification.handleSuccess;
  handleError: UseNotification.handleError;
  user: UseUserType;
};

function ClosedCompetitionCard({
  competition,
  handleSuccess,
  user,
  handleError,
  notifiedCompetitions,
}: ClosedCompetitionCardProps) {
  const [showMailButton, setShowMailButton] = useState(
    !notifiedCompetitions.includes(competition.competitionId)
  );
  const [showMembers, setShowMembers] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    stake,
    sponsored,
    payoutRule,
    maxMembers,
    members,
    poolAddress,
    name,
    games,
    competitionId,
  } = competition || {};

  const firstGame = competition.games[0];
  const gameResults = calculateWinnings(
    firstGame,
    sponsored ? stake / maxMembers : stake,
    firstGame.event.outcome,
    payoutRule
  );

  const handleNotify = async () => {
    setLoading(true);
    try {
      const { data: winners } = await axios({
        method: 'POST',
        url: '/api/betting/admin/notifyAfterClosing',
        data: { id: competition.competitionId },
      });
      handleSuccess(
        `Notified ${winners.length} ${pluralize(
          winners.length,
          'User'
        )}: ${winners.map((w) => w.userName).join(', ')}`
      );
      setShowMailButton(false);
    } catch (error) {
      console.log(error);
      handleError(error, user.wunderId, user.userName);
    }
    setLoading(false);
  };

  const handleShareResults = () => {
    setScreenshotMode(true);
  };

  return (
    <>
      <ShareCompetitionCard
        competition={competition}
        screenshotMode={screenshotMode}
        setScreenshotMode={setScreenshotMode}
        handleError={handleError}
        user={user}
      />
      <Paper className="p-3 my-2 rounded-xl relative">
        {members.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            <p className="text-lg flex items-center justify-center font-medium px-2 min-w-[2.5rem] w-auto h-6 rounded-full bg-red-500 text-white">
              {members.length}
            </p>
            <button
              className="btn-casama py-1 px-2"
              onClick={handleShareResults}
            >
              <FiShare />
            </button>
            {showMailButton && (
              <button
                className="btn-casama py-1 px-2"
                onClick={handleNotify}
                disabled={loading}
              >
                <BiMailSend />
              </button>
            )}
          </div>
        )}
        <Link href={`/betting/${poolAddress}`}>
          <a className="text-lg font-medium">{name}</a>
        </Link>
        {games.map((game) => {
          return (
            <div
              key={`game-${competitionId}-${game.id}`}
              className="flex flex-col sm:flex-row items-center gap-2 w-full"
            >
              <MdSportsSoccer className="text-5xl text-casama-blue" />
              <div className="flex-grow flex flex-col w-full">
                <div className="sm:mr-10">
                  <p className="text-casama-blue">{game.event?.shortName}</p>
                  <p>
                    Status: {game.state} / {game.event.state}
                  </p>
                </div>
                <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <p>Stake: {stake} $</p>
                </div>
              </div>
            </div>
          );
        })}
        <Collapse in={showMembers}>
          {showMembers && (
            <ParticipantTable
              participants={competition.games[0]?.participants}
              stake={sponsored ? 0 : stake}
              user={user}
            />
          )}
        </Collapse>
        <div
          onClick={() => setShowMembers((show) => !show)}
          className="flex justify-center text-3xl text-casama-blue cursor-pointer"
        >
          <div
            className={`transition-transform ${
              showMembers ? 'rotate-180' : ''
            }`}
          >
            <IoIosArrowDown />
          </div>
        </div>
      </Paper>
    </>
  );
}

type AdminBettingPageProps = {
  user: UseUserType;
  handleSuccess: UseNotification.handleSuccess;
  handleError: UseNotification.handleError;
  notifiedCompetitions: number[];
};

export default function AdminBettingPage(props: AdminBettingPageProps) {
  const { user, handleError } = props;
  const router = useRouter();
  const [chain, setChain] = useState<SupportedChain>(user.preferredChain);
  const [competitions, setCompetitions] = useState([]);
  const [closedCompetitions, setClosedCompetitions] = useState([]);
  const [events, setEvents] = useState([]);
  const [listedEvents, setListedEvents] = useState([]);

  const [showListedEvents, setShowListedEvents] = useState(false);
  const [showOpenEvents, setShowOpenEvents] = useState(false);
  const [showCompetitions, setShowCompetitions] = useState(false);
  const [showClosedCompetitions, setShowClosedCompetitions] = useState(false);

  const fetchEvents = (fetchListed = false) => {
    axios({ url: '/api/betting/events' })
      .then((res) => {
        setEvents(res.data.sort(sortByStartTime));
        fetchListed && fetchListedEvents();
      })
      .catch((err) => {
        handleError('Could not fetch events');
        setEvents([]);
      });
  };

  const fetchListedEvents = () => {
    axios({ url: '/api/betting/events/listed' })
      .then((res) => {
        setListedEvents(res.data.sort(sortByStartTime));
      })
      .catch((err) => {
        handleError('Could not fetch listed events');
        setListedEvents([]);
      });
  };

  const removeListedEvent = (id) => {
    setListedEvents((evs) => evs.filter((ev) => ev.id != id));
  };

  const fetchCompetitions = () => {
    axios({
      url: '/api/betting/competitions',
      params: { states: 'LIVE,UPCOMING', chain },
    })
      .then((res) => {
        setCompetitions(res.data?.content);
      })
      .catch((err) => {
        handleError('Could not fetch competitions');
        setCompetitions([]);
      });
    axios({
      url: '/api/betting/competitions',
      params: {
        states: 'HISTORIC',
        sort: 'endTimestamp,desc',
        size: 50,
        chain,
      },
    })
      .then((res) => {
        setClosedCompetitions(res.data?.content);
      })
      .catch((err) => {
        setClosedCompetitions([]);
      });
  };

  useEffect(() => {
    fetchEvents(true);
    fetchCompetitions();
  }, [chain]);

  useEffect(() => {
    if (router.isReady && user.isReady) {
      if (!user.isAdmin) {
        router.push('/betting/multi');
      } else {
        fetchCompetitions();
        fetchEvents(true);
      }
    }
  }, [user.isReady, router.isReady]);

  return (
    <Container maxWidth="xl">
      <div className="flex items-center justify-end mt-5">
        <Select
          value={chain}
          onChange={(e) => setChain(e.target.value as SupportedChain)}
        >
          <MenuItem value="gnosis">Gnosis</MenuItem>
          <MenuItem value="polygon">Polygon</MenuItem>
        </Select>
      </div>

      <Stack spacing={1} my={3}>
        <div className="flex items-center gap-3">
          <p className="text-2xl">Upcoming Events</p>
          <ToggleButton
            state={showListedEvents}
            setState={setShowListedEvents}
          />
        </div>
        <Collapse in={showListedEvents}>
          {listedEvents.map((event) => {
            return (
              <ListedEventCard
                key={`listed-event-${event.id}`}
                event={event}
                fetchEvents={fetchEvents}
                removeListedEvent={removeListedEvent}
                chain={chain}
                {...props}
              />
            );
          })}
        </Collapse>
        <Divider />
        <div className="flex items-center gap-3">
          <p className="text-2xl">Open Events</p>
          <ToggleButton state={showOpenEvents} setState={setShowOpenEvents} />
        </div>
        <Collapse in={showOpenEvents}>
          {events.map((event) => {
            return (
              <EventCard
                key={`event-${event.version}-${event.id}`}
                event={event}
                competitions={competitions.filter((comp) =>
                  comp.games.find((g) => g.event.id == event.id)
                )}
                fetchEvents={fetchEvents}
                fetchCompetitions={fetchCompetitions}
                {...props}
              />
            );
          })}
        </Collapse>
        <Divider />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <div className="flex items-center gap-3">
            <p className="text-2xl">Active Competitions</p>
            <ToggleButton
              state={showCompetitions}
              setState={setShowCompetitions}
            />
          </div>
          <button
            className="text-3xl text-casama-blue"
            onClick={fetchCompetitions}
          >
            <IoMdRefresh />
          </button>
        </Stack>
        <Collapse in={showCompetitions}>
          {competitions.map((competition) => {
            return (
              <CompetitionCard
                key={`competition-${competition.competitionId}`}
                competition={competition}
                fetchCompetitions={fetchCompetitions}
                {...props}
              />
            );
          })}
        </Collapse>
        <Divider />
        <div className="flex items-center gap-3">
          <p className="text-2xl">Closed Competitions</p>
          <ToggleButton
            state={showClosedCompetitions}
            setState={setShowClosedCompetitions}
          />
        </div>
        <Collapse in={showClosedCompetitions}>
          {closedCompetitions.map((competition) => {
            return (
              <ClosedCompetitionCard
                key={`competition-${competition.competitionId}`}
                competition={competition}
                {...props}
              />
            );
          })}
        </Collapse>
      </Stack>
    </Container>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {
      notifiedCompetitions: JSON.parse(
        fs.readFileSync('./data/notifiedAfterClosing.json', 'utf8')
      ),
    },
  };
}
