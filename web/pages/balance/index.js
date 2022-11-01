import { Container } from '@mui/material';
import WalletBalance from '/components/general/profile/walletBalance';

export default function Balance(props) {
  return (
    <Container className="mt-5" maxWidth="lg">
      <WalletBalance {...props} />
    </Container>
  );
}