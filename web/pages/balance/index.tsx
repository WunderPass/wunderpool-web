import { Container } from '@mui/material';
import WalletBalance from '../../components/general/profile/walletBalance';
import { UseNotification } from '../../hooks/useNotification';
import { UseUserType } from '../../hooks/useUser';

type BalanceProps = {
  user: UseUserType;
  handleError: UseNotification.handleError;
};

export default function Balance(props: BalanceProps) {
  return (
    <Container className="mt-5" maxWidth="lg">
      <WalletBalance {...props} />
    </Container>
  );
}
