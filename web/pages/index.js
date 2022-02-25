import { Container, Stack, Typography } from '@mui/material';
import LoginWithWunderPass from '/components/auth/loginWithWunderPass';

export default function Home() {
  return (
    <Container maxWidth="md">
      <Stack spacing={3} alignItems="center">
        <Typography variant="h3">WunderPool</Typography>
        <LoginWithWunderPass name="WunderPool" redirect={"pool"} image="https://img.ifunny.co/images/f360247a15cf0bed362b8e9ddbe9786c0465023c969906d57f3f5bf85aa2656e_1.webp"/>
      </Stack>
    </Container>
  )
}
