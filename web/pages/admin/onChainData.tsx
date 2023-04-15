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
import {
  compAddr,
  FormattedUser,
  formatUser,
} from '../../services/memberHelpers';
import axios from 'axios';
import { currency } from '../../services/formatter';
import ParticipantTable from '../../components/betting/games/ParticipantTable';
import { UseUserType } from '../../hooks/useUser';
import {
  SupportedChain,
  SupportedDistributorVersion,
} from '../../services/contract/types';
import { BigNumber } from 'ethers';
import { UsersFindResponse } from '../api/users/find';
import { UseNotification } from '../../hooks/useNotification';

type RawEventData = {
  name: string;
  eventType: number;
  resolved: boolean;
  owner: string;
  startDate: BigNumber;
  endDate: BigNumber;
  outcome: BigNumber[];
};

type OnChainEvent = {
  name: string;
  eventType: string;
  resolved: boolean;
  owner: string;
  startDate: Date;
  endDate: Date;
  outcome: number[];
};

function formatEvent({
  endDate,
  eventType,
  name,
  outcome,
  owner,
  resolved,
  startDate,
}: RawEventData): OnChainEvent {
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

type RawGameData = {
  closed: boolean;
  name: string;
  participants: [string, [BigNumber, BigNumber]][];
  payoutRule: number;
  stake: BigNumber;
  tokenAddress: string;
};

type OnChainGame = {
  name: string;
  closed: boolean;
  payoutRule: string;
  participants: (FormattedUser & {
    prediction: [number, number];
  })[];
  stake: number;
  tokenAddress: string;
};

async function formatGame({
  closed,
  name,
  participants,
  payoutRule,
  stake,
  tokenAddress,
}: RawGameData): Promise<OnChainGame> {
  const { data: resolvedParticipants }: { data: UsersFindResponse<string[]> } =
    await axios({
      method: 'POST',
      url: '/api/users/find',
      data: { addresses: participants.map(([addr]) => addr) },
    });
  const resolvedUsers = resolvedParticipants.map(formatUser);

  return {
    name,
    closed,
    payoutRule: ['WINNER_TAKES_IT_ALL', 'PROPORTIONAL'][payoutRule],
    participants: participants.map(([addr, pred]) => ({
      address: addr,
      ...resolvedUsers.find((u) => compAddr(u.address, addr)),
      prediction: [pred[0].toNumber(), pred[1].toNumber()],
    })),
    stake: stake.toNumber(),
    tokenAddress,
  };
}

type AdminOnChainDataProps = {
  user: UseUserType;
  handleError: UseNotification.handleError;
};

export default function AdminOnChainData(props: AdminOnChainDataProps) {
  const { user, handleError } = props;
  const router = useRouter();
  const [distributorVersion, setDistributorVersion] =
    useState<SupportedDistributorVersion>('GAMMA');
  const [chain, setChain] = useState<SupportedChain>(user.preferredChain);
  const [eventId, setEventId] = useState('');
  const [event, setEvent] = useState<OnChainEvent>();
  const [loadingEvent, setLoadingEvent] = useState(false);

  const [gameId, setGameId] = useState('');
  const [game, setGame] = useState<OnChainGame>(null);
  const [loadingGame, setLoadingGame] = useState(false);
  const [error, setError] = useState(null);

  const contract = useMemo(() => {
    try {
      return initDistributor(distributorVersion, chain)[0];
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [distributorVersion, chain]);

  const getEventData = async (id = null) => {
    if (!contract) return;
    setLoadingEvent(true);
    const data = await contract.getEvent(id || eventId);
    setEvent(formatEvent(data));
    setLoadingEvent(false);
  };

  const getGameData = async () => {
    if (!contract) return;
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
    if (router.isReady && user.isReady) {
      if (!user.isAdmin) {
        router.push('/pools');
      }
    }
  }, [user.isReady, router.isReady]);

  return (
    <Container maxWidth="xl" className="mt-5">
      <Stack spacing={2}>
        <FormControl>
          <InputLabel id="select-label">Version</InputLabel>
          <Select
            labelId="select-label"
            value={distributorVersion}
            label="Version"
            onChange={(e) =>
              setDistributorVersion(
                e.target.value as SupportedDistributorVersion
              )
            }
          >
            <MenuItem value={'ALPHA'}>Alpha</MenuItem>
            <MenuItem value={'BETA'}>Beta</MenuItem>
            <MenuItem value={'GAMMA'}>Gamma</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="select-label">Chain</InputLabel>
          <Select
            labelId="select-label"
            value={chain}
            label="Chain"
            onChange={(e) => setChain(e.target.value as SupportedChain)}
          >
            <MenuItem value={'gnosis'}>Gnosis</MenuItem>
            <MenuItem value={'polygon'}>Polygon</MenuItem>
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
            <ParticipantTable
              participants={game.participants}
              user={user}
              stake={0}
            />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </Stack>
    </Container>
  );
}
