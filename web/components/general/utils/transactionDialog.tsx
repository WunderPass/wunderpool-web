import { Dialog } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import TransactionFrame from './transactionFrame';
import { AiOutlineClose } from 'react-icons/ai';

type TransactionDialogProps = {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
};

export default function TransactionDialog({
  open,
  onClose,
  children,
}: TransactionDialogProps) {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    setIsSafari(
      Boolean(
        window.navigator.userAgent.toLowerCase().match(/safari/) &&
          window.navigator.vendor.toLowerCase().match(/apple/)
      )
    );
  }, []);

  return (
    <Dialog
      className="w-full"
      fullWidth
      maxWidth="sm"
      open={!isSafari && open}
      onClose={onClose}
      PaperProps={{
        style: { borderRadius: 12 },
      }}
    >
      <div className="flex justify-end mt-4 mr-5">
        <button onClick={onClose}>
          <AiOutlineClose className="text-2xl" />
        </button>
      </div>
      {children}
      <TransactionFrame open={true} />
    </Dialog>
  );
}
