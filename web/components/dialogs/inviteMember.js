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
import TransactionFrame from '/components/utils/transactionFrame';
import Avatar from '/components/utils/avatar';

export default function InviteMemberDialog(props) {
  const { open, setOpen, wunderPool, handleSuccess, handleError } = props;
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setLoading(false);
    setSelectedUser(null);
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
        handleClose();
      })
      .catch((err) => {
        handleError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!open) return;
    axios({ url: '/api/proxy/users/all' })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [open]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: { borderRadius: 12 },
      }}
    >
      <DialogTitle>Invite Member</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1">
          Invite Users to the Pool. Invited Users can join your Pool
        </Typography>
        <Autocomplete
          className="mt-3 w-full leading-tight rounded-lg bg-[#F6F6F6] focus:bg-white focus:outline-none focus:border-kaico-extra-light-blue"
          options={users}
          value={selectedUser}
          isOptionEqualToValue={(option, val) => option.address == val.address}
          getOptionLabel={(option) => {
            return option.wunderId;
          }}
          filterOptions={filterOptions}
          onChange={handleChange}
          renderInput={(params) => (
            <TextField
              className="text-black rounded-lg"
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
                  <Avatar
                    wunderId={option.wunderId ? option.wunderId : null}
                    text={option.wunderId}
                    separator="-"
                  />
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
      <TransactionFrame open={loading} />
    </Dialog>
  );
}
