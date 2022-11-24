import {
  Collapse,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { registerEvent } from '/services/contract/betting/events';
import { MdSportsSoccer } from 'react-icons/md';
import { determineGame } from '/services/contract/betting/games';
import { IoMdRefresh } from 'react-icons/io';
import { AiFillUpCircle, AiOutlineDownCircle } from 'react-icons/ai';
import Link from 'next/link';

function TimeFrame({ start, end }) {
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

function EventCard({
  event,
  gameCount,
  fetchEvents,
  fetchCompetitions,
  handleSuccess,
  handleError,
}) {
  const [loading, setLoading] = useState(false);

  const settleAllGames = async () => {
    // setLoading(true);
    // axios({ url: '/api/betting/games' }).then(async (res) => {
    //   const openGames = res.data.filter(
    //     (g) => event.id == g.eventId && g.version == event.version && !g.closed
    //   );
    //   var closedGames = await Promise.all(
    //     openGames.map(async (game) => {
    //       return await determineGame(game.id, game.version)
    //         .then((res) => {
    //           handleSuccess(`Closed Game "${game.name}"`);
    //         })
    //         .catch((err) => {
    //           handleError(err);
    //         })
    //         .then(() => {
    //           setLoading(false);
    //         });
    //     })
    //   );
    //   return closedGames;
    // });
    handleError('NOT IMPLEMENTED');
  };

  const handleResolve = () => {
    // setLoading(true);
    // resolveEvent(event.id)
    //   .then((res) => {
    //     handleSuccess(`Resolved Event "${event.name}"`);
    //     fetchEvents(false);
    //     fetchCompetitions();
    //   })
    //   .catch((err) => {
    //     handleError(err);
    //   })
    //   .then(() => {
    //     setLoading(false);
    //     settleAllGames();
    //   });
    handleError('NOT IMPLEMENTED');
  };

  return (
    <Paper className="p-3 my-2 rounded-xl relative">
      {gameCount > 0 && (
        <p className="absolute top-3 right-3 text-lg flex items-center justify-center font-medium px-2 min-w-[2.5rem] h-6 rounded-full bg-red-500 text-white">
          {gameCount}
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
            <button
              className="btn-casama py-1 px-2 w-full sm:w-auto"
              onClick={handleResolve}
              disabled={loading || event.endDate > Number(new Date())}
            >
              Resolve
            </button>
          </div>
        </div>
      </div>
    </Paper>
  );
}

function ListedEventCard({
  event,
  fetchEvents,
  handleSuccess,
  handleError,
  removeListedEvent,
}) {
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setLoading(true);
    registerEvent(event.id)
      .then((res) => {
        handleSuccess(`Created Event "${event.name}"`);
        fetchEvents(false);
        setLoading(false);
        removeListedEvent(event.id);
      })
      .catch((err) => {
        handleError(err);
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

function CompetitionCard({
  competition,
  fetchCompetitions,
  handleSuccess,
  handleError,
}) {
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setLoading(true);
    determineGame(game.id, game.version)
      .then((res) => {
        console.log(res);
        handleSuccess(`Closed Game "${game.name}"`);
        fetchCompetitions();
      })
      .catch((err) => {
        handleError(err);
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
            key={`game-${competition.id}-${game.id}`}
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
                <button
                  className="btn-casama py-1 px-2 w-full sm:w-auto"
                  onClick={handleClose}
                  disabled={loading || !game.event?.resolved}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </Paper>
  );
}

export default function AdminBettingPage(props) {
  const { user } = props;
  const router = useRouter();
  const [competitions, setCompetitions] = useState([]);
  const [events, setEvents] = useState([]);
  const [listedEvents, setListedEvents] = useState([]);

  const [showListedEvents, setShowListedEvents] = useState(false);
  const [showOpenEvents, setShowOpenEvents] = useState(false);
  const [showCompetitions, setShowCompetitions] = useState(false);

  const fetchEvents = (fetchListed = false) => {
    axios({ url: '/api/betting/events/registered' }).then((res) => {
      setEvents(
        res.data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      );
      fetchListed && fetchListedEvents();
    });
  };

  const fetchListedEvents = () => {
    axios({ url: '/api/betting/events/listed' }).then((res) => {
      setListedEvents(
        res.data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      );
    });
  };

  const removeListedEvent = (id) => {
    setListedEvents((evs) => evs.filter((ev) => ev.id != id));
  };

  const fetchCompetitions = () => {
    axios({ url: '/api/betting/competitions' }).then((res) => {
      setCompetitions(
        res.data.filter((comp) => comp.games.find((g) => g.state != 'CLOSED'))
      );
    });
  };

  useEffect(() => {
    if (router.isReady && user.isReady) {
      if (!user.isAdmin) {
        router.push('/betting');
      } else {
        fetchCompetitions();
        fetchEvents(true);
      }
    }
  }, [user.isReady, router.isReady]);

  return (
    <Container maxWidth="xl">
      <Stack spacing={1} my={3}>
        <div className="flex items-center gap-3">
          <p className="text-2xl">Upcoming Events</p>
          <button onClick={() => setShowListedEvents((show) => !show)}>
            {showListedEvents ? (
              <AiFillUpCircle className="text-casama-blue text-2xl" />
            ) : (
              <AiOutlineDownCircle className="text-casama-blue text-2xl" />
            )}
          </button>
        </div>
        <Collapse in={showListedEvents}>
          {listedEvents.map((event) => {
            return (
              <ListedEventCard
                key={`listed-event-${event.id}`}
                event={event}
                fetchEvents={fetchEvents}
                removeListedEvent={removeListedEvent}
                {...props}
              />
            );
          })}
        </Collapse>
        <Divider />
        <div className="flex items-center gap-3">
          <p className="text-2xl">Open Events</p>
          <button onClick={() => setShowOpenEvents((show) => !show)}>
            {showOpenEvents ? (
              <AiFillUpCircle className="text-casama-blue text-2xl" />
            ) : (
              <AiOutlineDownCircle className="text-casama-blue text-2xl" />
            )}
          </button>
        </div>
        <Collapse in={showOpenEvents}>
          {events.map((event) => {
            return (
              <EventCard
                key={`event-${event.version}-${event.id}`}
                event={event}
                gameCount={
                  competitions.filter((comp) =>
                    comp.games.find((g) => g.event.id == event.id)
                  ).length
                }
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
            <button onClick={() => setShowCompetitions((show) => !show)}>
              {showCompetitions ? (
                <AiFillUpCircle className="text-casama-blue text-2xl" />
              ) : (
                <AiOutlineDownCircle className="text-casama-blue text-2xl" />
              )}
            </button>
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
                key={`competition-${competition.version}-${competition.id}`}
                competition={competition}
                fetchCompetitions={fetchCompetitions}
                {...props}
              />
            );
          })}
        </Collapse>
      </Stack>
    </Container>
  );
}
