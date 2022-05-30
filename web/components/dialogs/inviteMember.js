import {
  Autocomplete,
  createFilterOptions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function InviteMemberDialog(props) {
  const { open, setOpen, wunderPool, handleSuccess, handleError } = props;
  const [users, setUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setLoading(false);
    setOpen(false);
  };

  const filterOptions = createFilterOptions({
    stringify: (option) => `${option.address} ${option.wunderId}`,
  });

  const handleChange = (e, value, reason) => {
    if (reason == 'clear') {
      setSelectedUser(null);
    } else {
      setSelectedUser(value);
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    axios({
      url: '/api/proxy/users/select',
      params: { address: selectedUser?.address },
    });
    wunderPool
      .inviteUser(selectedUser?.address)
      .then((res) => {
        handleSuccess(`Added User ${selectedUser.wunderId} to the WhiteList`);
        setSelectedUser(null);
      })
      .catch((err) => handleError('Something went wrong'))
      .then(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    axios({ url: '/api/proxy/users/all' })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Invite Member</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <Autocomplete
          className="mt-3 w-full text-gray-700 leading-tight rounded-lg bg-[#F6F6F6] focus:bg-white focus:outline-none focus:border-kaico-extra-light-blue"
          options={users}
          isOptionEqualToValue={(option, val) => option.address == val.address}
          getOptionLabel={(option) => {
            return option.wunderId;
          }}
          filterOptions={filterOptions}
          onChange={handleChange}
          renderInput={(params) => (
            <TextField
              className="opacity-50 text-black rounded-lg"
              {...params}
              label="User"
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
                  <div className="flex border-solid text-black rounded-full bg-blue-300 w-10 h-10 items-center justify-center -ml-3 border-2 border-white uppercase">
                    <Typography>
                      {option.wunderId
                        .match(/(\w)-(\w)/)
                        .slice(1, 3)
                        .join('')}
                    </Typography>
                  </div>
                  <Stack flexGrow={1} overflow="hidden">
                    <Typography
                      variant="subtitle1"
                      whiteSpace="nowrap"
                      textOverflow="ellipsis"
                      overflow="hidden"
                    >
                      {option.wunderId}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="GrayText"
                      textOverflow="ellipsis"
                      overflow="hidden"
                    >
                      {option.address}
                    </Typography>
                  </Stack>
                </Stack>
              </li>
            );
          }}
        />
      </DialogContent>
      {loading ? (
        <Stack spacing={2} sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1">Adding Member...</Typography>
        </Stack>
      ) : (
        <DialogActions>
          <button className="btn btn-default" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={!selectedUser?.address}
          >
            Invite
          </button>
        </DialogActions>
      )}
      {loading && (
        <iframe
          className="w-auto"
          id="fr"
          name="transactionFrame"
          height="500"
        ></iframe>
      )}
    </Dialog>
  );
}
