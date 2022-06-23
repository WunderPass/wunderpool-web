import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

export default function InviteLinkButton(props) {
  const { wunderPool, handleSuccess, handleError } = props;
  const [open, setOpen] = useState(false);
  const [validFor, setValidFor] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    const secret = [...Array(33)]
      .map(() => (~~(Math.random() * 36)).toString(36))
      .join('');
    wunderPool
      .registerInviteLink(secret, validFor ?? 1)
      .then((res) => {
        setInviteLink(
          `${window.location.origin}/pools/join/${wunderPool.address}?secret=${secret}`
        );
      })
      .catch((err) => handleError(err))
      .then(() => setLoading(false));
  };

  return (
    <>
      <button
        className=" btn-neutral items-center w-full py-3 px-3"
        onClick={() => setOpen(true)}
      >
        <span className="cursor-pointer">
          <div className="flex flex-row items-center justify-center">
            <Typography className="text-lg mr-5 ml-2">
              Generate Invite Link
            </Typography>
          </div>
        </span>
      </button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: { borderRadius: 12 },
        }}
      >
        <DialogTitle>Generate Invite Link</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">
            How many users can use this link?
          </Typography>
          <TextField
            value={validFor}
            onChange={(_, val) => setValidFor(val)}
            label="Valid For"
          />
          {inviteLink && (
            <CopyToClipboard
              text={inviteLink}
              onCopy={() => handleSuccess('Copied Invite Link')}
            >
              <span className="cursor-pointer text-md">
                <div className="flex flex-row items-center">
                  <div>{inviteLink}</div>
                  <MdContentCopy className="text-gray-500 ml-4" />
                </div>
              </span>
            </CopyToClipboard>
          )}
        </DialogContent>
        {loading ? (
          <Stack spacing={2} sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1">Generating Link...</Typography>
          </Stack>
        ) : (
          <DialogActions>
            <button className="btn btn-default" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={validFor < 1}
            >
              Generate Link
            </button>
          </DialogActions>
        )}
        <iframe
          className="w-auto"
          id="fr"
          name="transactionFrame"
          height={loading ? '500' : '0'}
          style={{ transition: 'height 300ms ease' }}
        ></iframe>
      </Dialog>
    </>
  );
}
