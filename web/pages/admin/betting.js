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
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState(0);

  const handleCreate = () => {
    setLoading(true);
    registerEvent(name, endDate, eventType, { teams: [teamOne, teamTwo] })
      .then((res) => {
        console.log(res);
        handleSuccess(`Created Event "${name}"`);
        setOpen(false);
        fetchEvents();
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

  const handleResolve = () => {
    setLoading(true);
    resolveEvent(event.id, [valueOne, valueTwo])
      .then((res) => {
        console.log(res);
        handleSuccess(`Resolved Event "${event.name}"`);
        fetchEvents();
        fetchGames();
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => setLoading(false));
  };

  return !event.resolved || gameCount > 0 ? (
    <Paper className="p-3 my-2 rounded-xl">
      <Stack direction="row" spacing={1} alignItems="center">
        <MdSportsSoccer className="text-5xl text-casama-blue" />
        <Stack spacing={1} flexGrow="1">
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">{event.name}</Typography>
            <Typography>{new Date(event.endDate).toLocaleString()}</Typography>
          </Stack>
          <Typography>Owner: {event.owner}</Typography>
          <Typography>Games: {gameCount}</Typography>
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
        className="relative"
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
        {!event.resolved && (
          <button
            className="btn-casama py-1 px-2 sm:absolute right-0 w-full sm:w-auto sm:-translate-x-1/2"
            onClick={handleResolve}
            // disabled={loading || event.endDate > Number(new Date())}
            disabled={loading}
          >
            Resolve
          </button>
        )}
      </Stack>
    </Paper>
  ) : null;
}

function GameCard({ game, event, fetchGames, handleSuccess, handleError }) {
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setLoading(true);
    determineGame(game.id)
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

  const fetchEvents = () => {
    axios({ url: '/api/betting/events' }).then((res) => {
      setEvents(res.data);
    });
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
        fetchEvents();
      }
    }
  }, [user.address, router.isReady]);

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <div className="flex justify-end">
          <button
            onClick={() => setOpen(true)}
            className="btn-casama items-center mb-2 mt-3 py-3 px-3 text-lg"
          >
            New Event
          </button>
        </div>
        <div>
          <Typography variant="h4">Events</Typography>
          {events.map((event) => {
            return (
              <EventCard
                key={`event-${event.id}`}
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
              <GameCard
                key={`game-${game.id}`}
                game={game}
                event={events.find((e) => e.id == game.eventId)}
                fetchGames={fetchGames}
                {...props}
              />
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
