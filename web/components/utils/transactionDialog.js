import { Dialog } from '@mui/material';
import { useEffect, useState } from 'react';
import TransactionFrame from '/components/utils/transactionFrame';

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
      fullWidth
      maxWidth="sm"
      open={!isSafari && open}
      onClose={onClose}
      PaperProps={{
        style: { borderRadius: 12 },
      }}
    >
      {children}
      <TransactionFrame open={true} />
    </Dialog>
  );
}
