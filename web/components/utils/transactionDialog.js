import { Dialog } from '@mui/material';
import { useEffect, useState } from 'react';
import TransactionFrame from '/components/utils/transactionFrame';
import { AiOutlineClose } from 'react-icons/ai';

export default function TransactionDialog({ open, onClose, children }) {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    setIsSafari(
      window.navigator.userAgent.toLowerCase().match(/safari/) &&
        window.navigator.vendor.toLowerCase().match(/apple/)
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
