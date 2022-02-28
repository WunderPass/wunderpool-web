import { Container, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import LoginWithWunderPass from '/components/auth/loginWithWunderPass';

export default function Home(props) {
  const {user} = props;
  const router = useRouter();

  const handleSuccess = (data) => {
    user.updateWunderId(data.wunderId)
    user.updateAddress(data.address)
  }

  useEffect(() => {
    if (user.wunderId && user.address) {
      router.push('/pools')
    }
  }, [user])

  return (
    <Container maxWidth="md">
      <Stack spacing={3} alignItems="center">
        <Typography variant="h3">WunderPool</Typography>
        <LoginWithWunderPass name="WunderPool" redirect={"pools"} intent={['wunderId', 'address']} onSuccess={handleSuccess} image="https://img.ifunny.co/images/f360247a15cf0bed362b8e9ddbe9786c0465023c969906d57f3f5bf85aa2656e_1.webp"/>
      </Stack>
    </Container>
  )
}
