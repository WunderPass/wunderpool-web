import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import TransactionFrame from '/components/utils/transactionFrame';
import MemberInput from '../members/input';

export default function InviteMemberDialog(props) {
  const { open, setOpen, wunderPool, handleSuccess, handleError } = props;
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setLoading(false);
    setSelectedUser(null);
    setOpen(false);
  };

  const handleSubmit = () => {
    setLoading(true);
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
        <MemberInput
          selectedMembers={selectedUser}
          setSelectedMembers={setSelectedUser}
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
