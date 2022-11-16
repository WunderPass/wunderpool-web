import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useState } from 'react';
import QrCode from '/components/general/utils/qrCode';
import { BiShowAlt } from 'react-icons/bi';

export default function RevealLoginCode(props) {
  const { privKey } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn-settings" onClick={() => setOpen(true)}>
        <div className="flex flex-row justify-center items-center">
          <Typography>Show Seed as QR Code</Typography>{' '}
          <BiShowAlt className="ml-2  text-lg " />
        </div>
      </button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <DialogContent
          dividers
          sx={{ justifyContent: 'center', display: 'flex' }}
        >
          <QrCode text={privKey} {...props} />
        </DialogContent>
        <DialogTitle>Scan this QR Code to login on another device</DialogTitle>
      </Dialog>
    </>
  );
}
