import {
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { initDistributor } from '../../services/contract/betting/init';
import { compAddr, getNameFor } from '../../services/memberHelpers';
import axios from 'axios';
import { currency } from '../../services/formatter';
import ParticipantTable from '../../components/betting/games/ParticipantTable';

const admins = [
  '0x7e0b49362897706290b7312d0b0902a1629397d8', // Moritz
  '0xac4c7c8c3a2cfffd889c1fb78b7468e281032284', // Despot
  '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6', // Gerwin
  '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6', // Slava
  '0x466274eefdd3265e3d8085933e69890f33023048', // Max
];

// await searchMembers({ address: owner })

function formatEvent({
  endDate,
  eventType,
  name,
  outcome,
  owner,
  resolved,
  startDate,
}) {
  return {
    name,
    eventType: ['SOCCER'][eventType],
    resolved,
    owner,
    startDate: startDate
      ? new Date(startDate.mul(1000).toNumber())
      : new Date(endDate.mul(1000).toNumber()),
    endDate: new Date(endDate.mul(1000).toNumber()),
    outcome: outcome.map((o) => o.toNumber()),
  };
}

function formatMember(member) {
  return {
    email: member.email,
    userName: member.handle,
    firstName: member.firstname,
    lastName: member.lastname,
    phoneNumber: member.phone_number,
    address: member.wallet_address,
    wunderId: member.wunder_id,
  };
}

async function formatGame({
  closed,
  name,
  participants,
  payoutRule,
  stake,
  tokenAddress,
}) {
  const { data: resolvedParticipants } = await axios({
    method: 'POST',
    url: '/api/users/find',
    data: { addresses: participants.map(([addr]) => addr) },
  });
  const resolvedUsers = resolvedParticipants.map(formatMember);

  return {
    name,
    closed,
    payoutRule: ['WINNER_TAKES_IT_ALL', 'PROPORTIONAL'][payoutRule],
    participants: participants.map(([addr, pred]) => ({
      address: addr,
      ...resolvedUsers.find((u) => compAddr(u.address, addr)),
      prediction: pred.map((p) => p.toNumber()),
    })),
    stake: stake.toNumber(),
    tokenAddress,
  };
}

export default function AdminOnChainData(props) {
  const { user } = props;
  const router = useRouter();
  const [distributorVersion, setDistributorVersion] = useState('BETA');
  const [eventId, setEventId] = useState('');
  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const [gameId, setGameId] = useState('');
  const [game, setGame] = useState(null);
  const [loadingGame, setLoadingGame] = useState(false);
  const [error, setError] = useState(null);

  const contract = useMemo(() => {
    return initDistributor(distributorVersion)[0];
  }, [distributorVersion]);

  const getEventData = async (id = null) => {
    setLoadingEvent(true);
    const data = await contract.getEvent(id || eventId);
    setEvent(formatEvent(data));
    setLoadingEvent(false);
  };

  const getGameData = async () => {
    setLoadingGame(true);
    setError(null);
    const data = await contract.getGame(gameId);
    if (data.name.length == 0) {
      setLoadingGame(false);
      setError('Game Not Found');
      setGame(null);
    } else {
      setGame(await formatGame(data));
      setLoadingGame(false);
      await getEventData(data.eventId);
    }
  };

  useEffect(() => {
    if (router.isReady && user.address) {
      if (!admins.includes(user.address.toLowerCase())) {
        router.push('/pools');
      }
    }
  }, [user.address, router.isReady]);

  return (
    <Container maxWidth="xl" className="mt-5">
      <Stack spacing={2}>
        <FormControl>
          <InputLabel id="select-label">Version</InputLabel>
          <Select
            labelId="select-label"
            value={distributorVersion}
            label="Version"
            onChange={(e) => setDistributorVersion(e.target.value)}
          >
            <MenuItem value={'ALPHA'}>Alpha</MenuItem>
            <MenuItem value={'BETA'}>Beta</MenuItem>
          </Select>
        </FormControl>
        <h3 className="text-xl text-casama-blue">Get Event Data</h3>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Event ID"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          />
          <button
            disabled={loadingEvent}
            className="btn-casama px-3 py-2"
            onClick={getEventData}
          >
            FIND
          </button>
        </Stack>
        {event && (
          <div className="container-gray flex flex-col gap-2">
            <h4 className="text-2xl text-casama-blue">{event.name}</h4>
            <p>Resolved: {event.resolved ? '✅' : '❌'}</p>
            <p>Type: {event.eventType}</p>
            <p>Owner: {event.owner}</p>
            <p>Start: {event.startDate.toLocaleString()}</p>
            <p>End: {event.endDate.toLocaleString()}</p>
            <p>
              Outcome: {event.outcome[0]}:{event.outcome[1]}
            </p>
          </div>
        )}
        <h3 className="text-xl text-casama-blue">Get Game Data</h3>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          />
          <button
            disabled={loadingGame}
            className="btn-casama px-3 py-2"
            onClick={getGameData}
          >
            FIND
          </button>
        </Stack>
        {game && (
          <div className="container-gray flex flex-col gap-2">
            <h4 className="text-2xl text-casama-blue">{game.name}</h4>
            <p>Closed: {game.closed ? '✅' : '❌'}</p>
            <p>PayoutRule: {game.payoutRule}</p>
            <p>Stake: {currency(game.stake / 1000000)}</p>
            <ParticipantTable participants={game.participants} user={user} />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </Stack>
    </Container>
  );
}
