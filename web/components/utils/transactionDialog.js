import { Dialog } from '@mui/material';
import useWunderPass from '/hooks/useWunderPass';
import TransactionFrame from '/components/utils/transactionFrame';

export default function TransactionDialog({ open, onClose, children }) {
  const { isSafari } = useWunderPass({});

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
