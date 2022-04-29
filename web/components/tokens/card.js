import { Button, Paper, Stack, Typography } from "@mui/material";

export default function TokenCard(props) {
  const { token } = props;

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack spacing={2} direction="row" alignItems="center">
          <img width="50" src={token.image || "/favicon.ico"} alt="TKN" />
          <Stack spacing={1}>
            <Typography variant="h6">
              {token.name} ({token.symbol})
            </Typography>
            <Typography variant="subtitle1">
              Balance: {token.usdValue}
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Button color="warning" onClick={() => handleSwap(token)}>
            Swap
          </Button>
          <Button color="error" onClick={() => handleSell(token)}>
            Sell
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
