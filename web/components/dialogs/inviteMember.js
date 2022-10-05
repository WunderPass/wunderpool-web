import { DialogActions, Typography } from '@mui/material';
import { useState } from 'react';
import TransactionFrame from '/components/utils/transactionFrame';
import MemberInput from '../members/input';
import ResponsiveDialog from '../utils/responsiveDialog';

export default function InviteMemberDialog(props) {
  const { user, open, setOpen, wunderPool, handleSuccess, handleError } = props;
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
    <ResponsiveDialog
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      title="Invite Member"
      actions={
        !loading && (
          <DialogActions className="flex items-center justify-center mx-4">
            <button className="btn-neutral w-full py-3" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-casama w-full py-3 mt-2"
              onClick={handleSubmit}
              disabled={!selectedUser?.address}
            >
              Invite
            </button>
          </DialogActions>
        )
      }
    >
      <Typography variant="subtitle1">
        Invite Users to the Pool. Invited Users can join your Pool
      </Typography>
      <MemberInput
        user={user}
        selectedMembers={selectedUser}
        setSelectedMembers={setSelectedUser}
      />
      <TransactionFrame open={loading} />
    </ResponsiveDialog>
  );
}
