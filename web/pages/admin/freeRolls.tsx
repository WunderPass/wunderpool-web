import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  Container,
  Stack,
  Typography,
  TextField,
  Autocomplete,
  Checkbox,
  Select,
  MenuItem,
  Collapse,
  LinearProgress,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { createFreeRollCompetition } from '../../services/contract/betting/competitions';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { MdSportsSoccer } from 'react-icons/md';
import CurrencyInput from '../../components/general/utils/currencyInput';
import MemberInput from '../../components/general/members/input';
import { UseUserType } from '../../hooks/useUser';
import { UseNotification } from '../../hooks/useNotification';
import { FormattedEvent } from '../../services/bettingHelpers';

type EventInputProps = {
  events: FormattedEvent[];
  setEvent: Dispatch<SetStateAction<FormattedEvent>>;
};

function EventInput({ events, setEvent }: EventInputProps) {
  const filterOptions = createFilterOptions<FormattedEvent>({
    stringify: (option) => `${option.name}`,
  });

  const handleChange = (e, value: FormattedEvent, reason) => {
    if (reason == 'clear') {
      setEvent(undefined);
    } else {
      setEvent(value);
    }
  };

  return (
    <Autocomplete<FormattedEvent>
      className=" w-full text-gray-700 leading-tight rounded-lg bg-[#F6F6F6] focus:bg-white focus:outline-none focus:border-casama-extra-light-blue"
      options={events}
      loading={!Boolean(events)}
      isOptionEqualToValue={(option, val) => option.id == val.id}
      getOptionLabel={(option) => {
        return option.name;
      }}
      filterOptions={filterOptions}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          className="opacity-50 text-black rounded-lg"
          {...params}
          label="Event"
          inputProps={{ ...params.inputProps }}
        />
      )}
      renderOption={(props, option) => {
        return (
          <li {...props}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ height: '50px', width: '100%' }}
            >
              <MdSportsSoccer className="text-xl text-casama-blue" />
              <div className="flex flex-col overflow-hidden flex-grow">
                <Typography
                  variant="subtitle1"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  overflow="hidden"
                >
                  {option.name}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="GrayText"
                  textOverflow="ellipsis"
                  overflow="hidden"
                >
                  {new Date(option.startTime).toLocaleString()}
                </Typography>
              </div>
              <div className="hidden sm:flex gap-1 items-center">
                <img
                  src={`/api/betting/events/teamImage?id=${option.teamHome.id}`}
                  className="w-7"
                />
                <p className="font-bold">vs.</p>
                <img
                  src={`/api/betting/events/teamImage?id=${option.teamAway.id}`}
                  className="w-7"
                />
              </div>
            </Stack>
          </li>
        );
      }}
    />
  );
}

type AdminFreeRollsPageProps = {
  user: UseUserType;
  handleSuccess: UseNotification.handleSuccess;
  handleError: UseNotification.handleError;
};

export default function AdminFreeRollsPage(props: AdminFreeRollsPageProps) {
  const { user, handleSuccess, handleError } = props;
  const router = useRouter();
  const [events, setEvents] = useState<FormattedEvent[]>();
  const [loading, setLoading] = useState(false);

  const [event, setEvent] = useState<FormattedEvent>();
  const [name, setName] = useState('');
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [payoutRule, setPayoutRule] = useState('PROPORTIONAL');
  const [stake, setStake] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const fetchEvents = () => {
    axios({
      url: '/api/betting/events/registered',
    }).then((res) => {
      setEvents(res.data);
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const competitionId = await createFreeRollCompetition({
        name: name || event.name,
        eventIds: [event.id],
        invitations: invitedMembers.map((m) => m.address),
        payoutRule,
        stake: Number(stake),
        isPublic,
        maxMembers: Number(maxMembers),
        version: event.version,
        chain: event.chain,
      });
      handleSuccess(`FreeRoll was created! (ID: ${competitionId})`);
    } catch (error) {
      console.log(error);
      handleError(error, user.wunderId, user.userName);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (router.isReady && user.isReady) {
      if (!user.isAdmin) {
        router.push('/betting/multi');
      } else {
        fetchEvents();
      }
    }
  }, [user.isReady, router.isReady]);

  return (
    <Container maxWidth="xl">
      {events ? (
        <div className="flex flex-col gap-3 mt-5">
          <h1 className="text-xl font-semibold text-center">
            Free Roll Manager
          </h1>
          <EventInput events={events} setEvent={setEvent} />
          {event && event.id && (
            <div className="mt-5 flex flex-col gap-3">
              <div>
                <label>Competition Name</label>
                <input
                  className="textfield py-4 px-3 mt-2"
                  placeholder="Competition Name"
                  value={name || event.name}
                  onChange={(e) => {
                    setName(e.target.value || event.name);
                  }}
                />
              </div>
              <div>
                <label>Pot Size</label>
                <CurrencyInput
                  value={stake}
                  placeholder="$ 100"
                  onChange={(val) => setStake(val)}
                />
              </div>
              <div>
                <label>Max Members</label>
                <input
                  className="textfield py-4 px-3 mt-2"
                  placeholder="50"
                  type="number"
                  value={maxMembers}
                  onChange={(e) => {
                    setMaxMembers(e.target.value);
                  }}
                />
              </div>
              <div className="flex flex-col">
                <label>Payout Rule</label>
                <Select
                  value={payoutRule}
                  onChange={(e) => setPayoutRule(e.target.value)}
                  className="mt-2"
                >
                  <MenuItem value={'PROPORTIONAL'}>Proportional</MenuItem>
                  <MenuItem value={'WINNER_TAKES_IT_ALL'}>
                    Winner Takes It All
                  </MenuItem>
                </Select>
              </div>
              <div>
                <div className="flex gap-3 items-center mb-3">
                  <Checkbox
                    checked={isPublic}
                    onChange={(_, checked) => {
                      setIsPublic(checked);
                      if (checked) setInvitedMembers([]);
                    }}
                  />
                  <label>Public</label>
                </div>
                <Collapse in={!isPublic}>
                  <label>Select Invited Users</label>
                  <MemberInput
                    selectedMembers={invitedMembers}
                    setSelectedMembers={setInvitedMembers}
                    multiple
                    user={user}
                  />
                </Collapse>
              </div>
              {loading ? (
                <>
                  <LinearProgress />
                  <p className="text-gray-500 text-center">
                    Free Roll Competition is being created
                  </p>
                </>
              ) : (
                <button
                  disabled={Number(stake) == 0}
                  onClick={handleSubmit}
                  className="btn-casama py-2 px-3"
                >
                  Create
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <h2 className="text-center text-2xl">Ladet...</h2>
      )}
    </Container>
  );
}
