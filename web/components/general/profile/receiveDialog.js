import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import QrCode from '/components/general/utils/qrCode';
import { MdContentCopy } from 'react-icons/md';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function ReceiveDialog(props) {
  const { open, setOpen, user } = props;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      PaperProps={{
        style: { borderRadius: 12 },
      }}
      open={open}
      onClose={handleClose}
      className="w-full"
    >
      <DialogTitle>Receive USDC</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <div className="container-gray-p-0 p-2 w-full cursor-pointer active:bg-green-300">
            <CopyToClipboard text={user?.address}>
              <div className="flex flex-row items-center justify-start ">
                <MdContentCopy className="text-4xl mr-2" />
                <div className="text-lg truncate ...">{user?.address}</div>
              </div>
            </CopyToClipboard>
          </div>
        </DialogContentText>
        <DialogContentText>
          <div className="flex items-center justify-center my-6 mt-8">
            <div className="">
              <QrCode
                text={user?.address}
                dark="text.primary"
                size={7}
                {...props}
              />
            </div>
          </div>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
