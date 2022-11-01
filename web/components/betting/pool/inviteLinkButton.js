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
import TransactionFrame from '/components/general/utils/transactionFrame';

function ContentWithLink(props) {
  const { inviteLink, handleSuccess } = props;

  return (
    <DialogContent>
      <label className="label" htmlFor="validFor">
        Your Invite Link
      </label>
      <CopyToClipboard
        text={inviteLink}
        onCopy={() => handleSuccess('Copied Invite Link')}
      >
        <span className="cursor-pointer text-md">
          <div className="flex flex-row items-center my-6">
            <div className="text-casama-blue truncate ...">{inviteLink}</div>
            <MdContentCopy className="text-gray-500 text-2xl ml-2" />
          </div>
        </span>
      </CopyToClipboard>
      <CopyToClipboard
        text={inviteLink}
        onCopy={() => handleSuccess('Copied Invite Link')}
      >
        <button className="btn btn-casama w-full">Copy Link</button>
      </CopyToClipboard>
    </DialogContent>
  );
}

function ContentWithoutLink(props) {
  const { loading, validFor, setValidFor, handleSubmit, handleClose } = props;

  return (
    <>
      <DialogContent>
        <label className="label" htmlFor="validFor">
          How many users can use this link?
        </label>
        <input
          className="textfield py-4 px-3 mt-2"
          id="validFor"
          type="number"
          min={1}
          placeholder="1"
          disabled={loading}
          value={validFor}
          onChange={(e) => {
            setValidFor(e.target.value);
          }}
        />
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
            className="btn btn-casama"
            onClick={handleSubmit}
            disabled={validFor < 1}
          >
            Generate Link
          </button>
        </DialogActions>
      )}
      <TransactionFrame open={loading} />
    </>
  );
}

export default function InviteLinkButton(props) {
  const { wunderPool, handleSuccess, handleError } = props;
  const [open, setOpen] = useState(false);
  const [validFor, setValidFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const handleClose = () => {
    setOpen(false);
    setLoading(false);
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
          `${window.location.origin}/betting/pools/join/${wunderPool.poolAddress}?secret=${secret}`
        );
      })
      .catch((err) => handleError(err))
      .then(() => setLoading(false));
  };

  return wunderPool.version.number > 4 ? (
    <>
      <button
        className=" btn-casama-white items-center w-full py-3 px-3"
        onClick={() => setOpen(true)}
      >
        <span className="cursor-pointer">
          <div className="flex flex-row items-center justify-center">
            <Typography className="text-lg ">Generate Invite Link</Typography>
          </div>
        </span>
      </button>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: { borderRadius: 12 },
        }}
      >
        <DialogTitle>Generate Invite Link</DialogTitle>
        {inviteLink ? (
          <ContentWithLink
            inviteLink={inviteLink}
            handleSuccess={handleSuccess}
          />
        ) : (
          <ContentWithoutLink
            loading={loading}
            validFor={validFor}
            setValidFor={setValidFor}
            handleSubmit={handleSubmit}
            handleClose={handleClose}
          />
        )}
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
