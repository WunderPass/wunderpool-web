import {
  Button,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import SellIcon from "@mui/icons-material/Sell";

export default function TokenCard(props) {
  const { token, handleSell, handleSwap } = props;

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack spacing={2} direction="row" alignItems="center">
          <img width="50" src={token.image || "/favicon.ico"} alt="TKN" />
          <Stack spacing={1}>
            <Typography variant="h6">
              {token.name} ({token.symbol})
            </Typography>
            <Tooltip title={`Tokens: ${token.formattedBalance}`}>
              <Typography variant="subtitle1" width="fit-content">
                Balance: {token.usdValue}
              </Typography>
            </Tooltip>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Tooltip title="Swap Token">
            <IconButton color="info" onClick={() => handleSwap(token)}>
              <CurrencyExchangeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sell Token">
            <IconButton color="success" onClick={() => handleSell(token)}>
              <SellIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
