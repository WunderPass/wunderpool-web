import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useState } from 'react';
import QrCode from '/components/utils/qrCode';
import { BiShowAlt } from 'react-icons/bi';

export default function RevealLoginCode(props) {
  const { t } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn-settings" onClick={() => setOpen(true)}>
        <div className="flex flex-row justify-center items-center">
          <Typography>Show</Typography> <BiShowAlt className="ml-2  text-lg " />
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
          <QrCode
            text={`ADD PRIV KEY HERE`} //TODO
            {...props}
          />
        </DialogContent>
        <DialogTitle>Scan this QR Code to login on another device</DialogTitle>
      </Dialog>
    </>
  );
}
