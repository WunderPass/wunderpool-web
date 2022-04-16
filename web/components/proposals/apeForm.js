import {
  Button,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { createApeSuggestion } from "/services/contract/proposals";
import TokenInput from "../tokens/input";

export default function ApeForm(props) {
  const { setApe, address, fetchProposals, handleSuccess, handleError } = props;
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenName, setTokenName] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState(null);
  const [tokenImage, setTokenImage] = useState(null);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setTokenAddress("");
    setTokenName(null);
    setTokenSymbol(null);
    setTokenImage(null);
    setValue(0);
    setLoading(false);
    setApe(false);
  };

  const handleApe = (e) => {
    e.preventDefault();
    setLoading(true);
    createApeSuggestion(
      address,
      tokenAddress,
      `Let's Ape into ${tokenName} (${tokenSymbol})`,
      `We will ape ${value} USD into ${tokenName}`,
      value
    )
      .then((res) => {
        console.log(res);
        handleSuccess(`Created Proposal to Ape into ${tokenSymbol}`);
        fetchProposals();
        handleClose();
      })
      .catch((err) => {
        handleError(err);
      })
      .then(() => {
        setLoading(false);
      });
  };

  const handleValueInput = (e) => {
    setValue(e.target.value);
  };

  return (
    <form>
      <Stack width="100%" spacing={3}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5">APE</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <TokenInput
          setTokenAddress={setTokenAddress}
          setTokenName={setTokenName}
          setTokenSymbol={setTokenSymbol}
          setTokenImage={setTokenImage}
        />
        <Collapse in={tokenName && tokenSymbol ? true : false}>
          <Stack spacing={3}>
            <Stack
              spacing={2}
              alignItems="center"
              direction="row"
              sx={{ height: "50px" }}
            >
              <img height="100%" src={tokenImage || "/favicon.ico"} />
              <Typography variant="h4">
                {tokenName} ({tokenSymbol})
              </Typography>
            </Stack>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Ape Amount</InputLabel>
              <OutlinedInput
                type="number"
                value={value}
                onChange={handleValueInput}
                label="Ape Amount"
                placeholder="1"
                endAdornment={
                  <InputAdornment position="end">USD</InputAdornment>
                }
              />
            </FormControl>
          </Stack>
        </Collapse>
        {loading ? (
          <Button disabled variant="contained">
            Submitting Proposal...
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!tokenName || !tokenSymbol || value == 0}
            onClick={handleApe}
            variant="contained"
          >
            Ape Empfehlung abgeben
          </Button>
        )}
      </Stack>
    </form>
  );
}
