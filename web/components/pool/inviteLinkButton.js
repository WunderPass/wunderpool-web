import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { MdContentCopy } from 'react-icons/md';
import { BsLink45Deg } from 'react-icons/bs';

export default function InviteLinkButton(props) {
  const { wunderPool, handleSuccess, handleError } = props;
  const [open, setOpen] = useState(false);
  const [validFor, setValidFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const handleClose = () => {
    setOpen(false);
    setValidFor('');
    setInviteLink('');
  };

  const handleSubmit = () => {
    setLoading(true);
    const secret = [...Array(33)]
      .map(() => (~~(Math.random() * 36)).toString(36))
      .join('');
    wunderPool
      .createInviteLink(secret, validFor ?? 1)
      .then((res) => {
        setInviteLink(
          `${window.location.origin}/pools/join/${wunderPool.poolAddress}?secret=${secret}`
        );
      })
      .catch((err) => handleError(err))
      .then(() => setLoading(false));
  };

  return wunderPool.version.number > 4 ? (
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
        fullWidth
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: { borderRadius: 12 },
        }}
      >
        <DialogTitle>Generate Invite Link</DialogTitle>
        <DialogContent>
          <label className="label" htmlFor="validFor">
            How many users can use this link?
          </label>
          <input
            className="textfield py-4 px-3 mt-2 "
            id="validFor"
            type="number"
            min={1}
            placeholder="1"
            onChange={(e) => {
              setValidFor(e.target.value);
            }}
          />
          {inviteLink && (
            <CopyToClipboard
              text={inviteLink}
              onCopy={() => handleSuccess('Copied Invite Link')}
            >
              <span className="cursor-pointer text-md">
                <div className="flex flex-row items-center mt-2">
                  <div className="truncate ...">{inviteLink}</div>
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
              className="btn btn-kaico"
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
  ) : (
    <button className=" btn-neutral items-center w-full py-3 px-3">
      <CopyToClipboard
        text={window.location.href}
        onCopy={() => handleSuccess('Invite link copied!')}
      >
        <span className="cursor-pointer">
          <div className="flex flex-row items-center justify-center">
            <BsLink45Deg className="text-lg ml-1" />
            <Typography className="text-lg mr-5 ml-2">
              Copy Invite Link
            </Typography>
          </div>
        </span>
      </CopyToClipboard>
    </button>
  );
}
