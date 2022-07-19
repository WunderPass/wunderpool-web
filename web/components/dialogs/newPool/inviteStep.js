import {
  Autocomplete,
  createFilterOptions,
  DialogContentText,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import InitialsAvatar from '/components/utils/initialsAvatar';

export default function NewPoolInviteStep(props) {
  const { members, setMembers } = props;
  const [wunderIds, setWunderIds] = useState([]);

  const handleChange = (e, value, reason) => {
    setMembers(value);
  };

  const filterOptions = createFilterOptions({
    stringify: (option) => `${option.address} ${option.wunderId}`,
  });

  useEffect(async () => {
    const users = await axios({ url: '/api/proxy/users/all' });
    setWunderIds(users.data);
  }, []);

  return (
    <Stack spacing={1}>
      <DialogContentText className="text-sm mb-7 font-graphik">
        Step 3 of 3 | Invite members
      </DialogContentText>

      <div>
        <label className="label pr-52" htmlFor="poolName">
          Invite your friends via WunderPass
        </label>
        <Autocomplete
          className="w-full text-gray-700 my-4 leading-tight rounded-lg bg-[#F6F6F6] focus:outline-none"
          multiple
          options={wunderIds}
          value={members}
          onChange={handleChange}
          isOptionEqualToValue={(option, val) => option.address == val.address}
          getOptionLabel={(option) => {
            return option.wunderId;
          }}
          filterOptions={filterOptions}
          renderInput={(params) => (
            <TextField
              {...params}
              className="w-full text-gray-700 leading-tight rounded-lg bg-[#F6F6F6] focus:outline-none"
              label="WunderPass Users"
              placeholder="Members"
            />
          )}
          renderOption={(props, option) => {
            return (
              <li {...props}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <InitialsAvatar text={option.wunderId} separator="-" />
                  <Typography
                    variant="subtitle1"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    overflow="hidden"
                  >
                    {option.wunderId}
                  </Typography>
                </Stack>
              </li>
            );
          }}
        />
      </div>

      <Divider />

      <div className="flex justify-between items-center pt-4">
        <div className="flex flex-row justify-between items-center">
          <Typography className="mr-3">
            You can invite friends without a WunderPass after creating the Pool!
          </Typography>
        </div>
      </div>
    </Stack>
  );
}
