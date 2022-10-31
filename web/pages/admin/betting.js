import {
  Container,
  DialogActions,
  Divider,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { registerEvent, resolveEvent } from '/services/contract/betting/events';
import ResponsiveDialog from '/components/utils/responsiveDialog';
import { MdSportsSoccer } from 'react-icons/md';
import { determineGame } from '../../services/contract/betting/games';
import { IoMdRefresh } from 'react-icons/io';

const admins = [
  '0x7e0b49362897706290b7312d0b0902a1629397d8', // Moritz
  '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284', // Despot
  '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6', // Gerwin
  '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6', // Slava
  '0x466274eefdd3265e3d8085933e69890f33023048', // Max
];

const eventTypeMapping = {
  SOCCER: 0,
};

function NewEventDialog({
  open,
  setOpen,
  fetchEvents,
  handleSuccess,
  handleError,
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [teamOne, setTeamOne] = useState('');
  const [teamTwo, setTeamTwo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState(0);

  const handleCreate = () => {
    setLoading(true);
    registerEvent(name, startDate, endDate, eventType, {
      teams: [teamOne, teamTwo],
    })
      .then((res) => {
        console.log(res);
        handleSuccess(`Created Event "${name}"`);
        setName('');
        setTeamOne('');
        setTeamTwo('');
        setStartDate('');
        setEndDate('');
        setOpen(false);
        fetchEvents(false);
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => setLoading(false));
  };

  return (
    <ResponsiveDialog
      maxWidth="md"
      open={open}
      onClose={() => setOpen(false)}
      title="New Event"
      actions={
        <DialogActions className="flex items-center justify-center mx-4">
          <div className="flex flex-col items-center justify-center w-full">
            <button
              className="btn-neutral w-full py-3"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-casama w-full py-3 mt-2"
              onClick={handleCreate}
              disabled={loading}
            >
              Continue
            </button>
          </div>
        </DialogActions>
      }
    >
      {loading ? (
        <div className="px-6 pb-1">
          <Typography className="text-md text-center" color="GrayText">
            Creating {name}...
          </Typography>
        </div>
      ) : (
        <>
          <Stack spacing={2}>
            <div>
              <label className="label" htmlFor="eventName">
                Event Name
              </label>
              <input
                className="textfield py-4 px-3 mt-2"
                id="eventName"
                placeholder="WM Finale"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="eventStartDate">
                Start Date
              </label>
              <input
                className="textfield py-4 px-3 mt-2"
                id="eventStartDate"
                type="datetime-local"
                onChange={(e) => setStartDate(Number(new Date(e.target.value)))}
              />
            </div>
            <div>
              <label className="label" htmlFor="eventEndDate">
                End Date
              </label>
              <input
                className="textfield py-4 px-3 mt-2"
                id="eventEndDate"
                type="datetime-local"
                onChange={(e) => setEndDate(Number(new Date(e.target.value)))}
              />
            </div>
            <div>
              <label className="label" htmlFor="eventEndDate">
                Event Type
              </label>
              <Select
                className="textfield mt-2 outline-none"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <MenuItem value={0}>Soccer</MenuItem>
              </Select>
            </div>
            <div>
              <label className="label" htmlFor="teamOne">
                Team One
              </label>
              <input
                className="textfield py-4 px-3 mt-2"
                id="teamOne"
                placeholder="Team One"
                value={teamOne}
                onChange={(e) => setTeamOne(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="TeamTwo">
                Team Two
              </label>
              <input
                className="textfield py-4 px-3 mt-2"
                id="TeamTwo"
                placeholder="Team Two"
                value={teamTwo}
                onChange={(e) => setTeamTwo(e.target.value)}
              />
            </div>
          </Stack>
        </>
      )}
    </ResponsiveDialog>
  );
}

function EventCard({
  event,
  gameCount,
  fetchEvents,
  fetchGames,
  handleSuccess,
  handleError,
}) {
  const [loading, setLoading] = useState(false);
  const [valueOne, setValueOne] = useState('');
  const [valueTwo, setValueTwo] = useState('');

  const handleOutcomeInput = (index, value) => {
    if (index == 0) setValueOne(value);
    if (index == 1) setValueTwo(value);
  };

  const settleAllGames = async () => {
    setLoading(true);
    axios({ url: '/api/betting/games' }).then(async (res) => {
      const openGames = res.data.filter(
        (g) => event.id == g.eventId && g.version == event.version && !g.closed
      );
      var closedGames = await Promise.all(
        openGames.map(async (game) => {
          return await determineGame(game.id, game.version)
            .then((res) => {
              handleSuccess(`Closed Game "${game.name}"`);
            })
            .catch((err) => {
              handleError(err);
            })
            .then(() => {
              setLoading(false);
            });
        })
      );
      return closedGames;
    });
  };

  const handleResolve = () => {
    setLoading(true);
    resolveEvent(event.id, [valueOne, valueTwo], event.version)
      .then((res) => {
        handleSuccess(`Resolved Event "${event.name}"`);
        fetchEvents(false);
        fetchGames();
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => {
        setLoading(false);
        settleAllGames();
      });
  };

  return !event.resolved || gameCount > 0 ? (
    <Paper className="p-3 my-2 rounded-xl">
      <Stack direction="row" spacing={1} alignItems="center">
        <MdSportsSoccer className="text-5xl text-casama-blue" />
        <Stack direction="row" justifyContent="space-between" flexGrow="1">
          <Stack spacing={1}>
            <Typography variant="h6">{event.name}</Typography>
            <Typography>Owner: {event.owner}</Typography>
            <Typography>Games: {gameCount}</Typography>
          </Stack>
          <Stack spacing={1} justifyContent="space-between">
            <Typography>
              {new Date(event.startDate || event.endDate).toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <Divider />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mt={1}
        spacing={1}
        rowGap={2}
        flexWrap="wrap"
        className="relative w-full"
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          justifyContent="center"
          flexGrow="1"
        >
          <Typography>{event.teams[0]}</Typography>
          <div className="w-12">
            <input
              className="textfield text-center py-1 px-3"
              value={event.resolved ? event.outcome[0] : valueOne}
              onChange={(e) => handleOutcomeInput(0, e.target.value)}
              disabled={event.resolved}
            />
          </div>
          <Typography>:</Typography>
          <div className="w-12">
            <input
              className="textfield text-center py-1 px-3"
              value={event.resolved ? event.outcome[1] : valueTwo}
              onChange={(e) => handleOutcomeInput(1, e.target.value)}
              disabled={event.resolved}
            />
          </div>
          <Typography>{event.teams[1]}</Typography>
        </Stack>
        {event.resolved ? (
          <button
            className="btn-casama py-1 px-2 sm:absolute right-0 w-full sm:w-auto"
            onClick={() => settleAllGames()}
            // disabled={loading || event.endDate > Number(new Date())}
            disabled={loading}
          >
            Settle All Games
          </button>
        ) : (
          <button
            className="btn-casama py-1 px-2 sm:absolute right-0 w-full sm:w-auto"
            onClick={handleResolve}
            // disabled={loading || event.endDate > Number(new Date())}
            disabled={loading}
          >
            Resolve Event and settle all
          </button>
        )}
      </Stack>
    </Paper>
  ) : null;
}

function RecommendedEventCard({
  event,
  fetchEvents,
  handleSuccess,
  handleError,
  removeRecommendedEvent,
}) {
  const [loading, setLoading] = useState(false);
  const [endDate, setEndDate] = useState(
    Number(new Date(`${event.date} ${event.time}`)) + 7200000
  );

  const handleCreate = () => {
    setLoading(true);
    registerEvent(
      event.event_name,
      Number(new Date(`${event.date} ${event.time}`)),
      endDate,
      eventTypeMapping[event.event_type],
      {
        teams: [event.team_home, event.team_away],
        extId: event.event_id,
      }
    )
      .then((res) => {
        console.log(res);
        handleSuccess(`Created Event "${event.event_name}"`);
        fetchEvents(false);
        removeRecommendedEvent(event.event_id);
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => setLoading(false));
  };

  return (
    <Paper className="p-3 my-2 rounded-xl">
      <Stack direction="row" spacing={1} alignItems="center">
        <MdSportsSoccer className="text-5xl text-casama-blue" />
        <Stack spacing={1} flexGrow="1">
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">{event.event_name}</Typography>
            <Typography>
              {new Date(`${event.date} ${event.time}`).toLocaleString()}
            </Typography>
          </Stack>
          <Typography>
            {event.team_home} vs. {event.team_away}
          </Typography>
        </Stack>
      </Stack>
      <Divider />
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-end mt-2">
        <label
          className="label w-full sm:w-auto text-center"
          htmlFor={`eventEndDate-${event.event_id}`}
        >
          End Date
        </label>
        <input
          className="textfield py-4 px-3 w-full sm:w-4/12 sm:max-w-[200px]"
          id={`eventEndDate-${event.event_id}`}
          type="datetime-local"
          onChange={(e) => setEndDate(Number(new Date(e.target.value)))}
        />
        <button
          className="btn-casama py-1 px-2 w-full sm:w-3/12 sm:max-w-[200px]"
          onClick={handleCreate}
          disabled={
            loading || endDate < Number(new Date(`${event.date} ${event.time}`))
          }
        >
          Create Event
        </button>
      </div>
    </Paper>
  );
}

function GameCard({ game, event, fetchGames, handleSuccess, handleError }) {
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setLoading(true);
    determineGame(game.id, game.version)
      .then((res) => {
        console.log(res);
        handleSuccess(`Closed Game "${game.name}"`);
        fetchGames();
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => setLoading(false));
  };

  return (
    <Paper className="p-3 my-2 rounded-xl">
      <Stack direction="row" spacing={1} alignItems="center">
        <MdSportsSoccer className="text-5xl text-casama-blue" />
        <Stack spacing={1} flexGrow="1">
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">{game.name}</Typography>
            <button
              className="btn-casama py-1 px-2"
              onClick={handleClose}
              disabled={loading || !event?.resolved}
            >
              Settle
            </button>
          </Stack>
          <Typography>Event: {event?.name}</Typography>
          <Typography>Pool: {game.poolAddress}</Typography>
          <Typography>Participants: {game.participants.length}</Typography>
          <Typography>Stake: {game.stake}</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function AdminBettingPage(props) {
  const { user } = props;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [events, setEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);

  const fetchEvents = (fetchRecommended = false) => {
    axios({ url: '/api/betting/events' }).then((res) => {
      setEvents(res.data);
      fetchRecommended && fetchRecommendedEvents();
    });
  };

  const fetchRecommendedEvents = () => {
    axios({ url: '/api/betting/events/suggestions' }).then((res) => {
      setRecommendedEvents(res.data);
    });
  };

  const removeRecommendedEvent = (id) => {
    setRecommendedEvents((evs) => evs.filter((ev) => ev.id != id));
  };

  const fetchGames = () => {
    axios({ url: '/api/betting/games' }).then((res) => {
      setGames(res.data.filter((g) => !g.closed));
    });
  };

  useEffect(() => {
    if (router.isReady && user.address) {
      if (!admins.includes(user.address.toLowerCase())) {
        router.push('/pools');
      } else {
        fetchGames();
        fetchEvents(true);
      }
    }
  }, [user.address, router.isReady]);

  return (
    <Container maxWidth="xl">
      <Stack spacing={1}>
        <div className="flex justify-end">
          <button
            onClick={() => setOpen(true)}
            className="btn-casama items-center mb-2 mt-3 py-3 px-3 text-lg"
          >
            New Event
          </button>
        </div>
        <div>
          <Typography variant="h4">Upcoming Events</Typography>
          {recommendedEvents
            .filter((e) => !events.map((ev) => ev.extId).includes(e.event_id))
            .map((event) => {
              return (
                <RecommendedEventCard
                  key={`recommended-event-${event.event_id}`}
                  event={event}
                  fetchEvents={fetchEvents}
                  removeRecommendedEvent={removeRecommendedEvent}
                  {...props}
                />
              );
            })}
        </div>
        <div>
          <Typography variant="h4">Open Events</Typography>
          {events.map((event) => {
            return (
              <EventCard
                key={`event-${event.version}-${event.id}`}
                event={event}
                gameCount={games.filter((g) => g.eventId == event.id).length}
                fetchEvents={fetchEvents}
                fetchGames={fetchGames}
                {...props}
              />
            );
          })}
        </div>
        <div>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h4">Games</Typography>
            <button className="text-3xl text-casama-blue" onClick={fetchGames}>
              <IoMdRefresh />
            </button>
          </Stack>
          {games.map((game) => {
            return (
              <div key={`game-${game.version}-${game.id}`} className="mb-8">
                <GameCard
                  game={game}
                  event={events.find((e) => e.id == game.eventId)}
                  fetchGames={fetchGames}
                  {...props}
                />
              </div>
            );
          })}
        </div>
      </Stack>
      <NewEventDialog
        open={open}
        setOpen={setOpen}
        fetchEvents={fetchEvents}
        {...props}
      />
    </Container>
  );
}
