import { Dialog } from '@mui/material';
import useWunderPass from '/hooks/useWunderPass';
import TransactionFrame from '/components/utils/transactionFrame';

export default function TransactionDialog({ open, onClose, children }) {
  const { isSafari } = useWunderPass({});

  return (
    <Dialog
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
