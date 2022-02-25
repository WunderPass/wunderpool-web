import { Button, Collapse, Container, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';

export default function Pool(props) {
  const [ape, setApe] = useState(false)
  const [fud, setFud] = useState(false)
  const [tokenAddress, setTokenAddress] = useState("")

  const handleApe = (e) => {
    e.preventDefault();
    console.log(tokenAddress);
    setTokenAddress("");
    setApe(false);
  }

  const handleInput = (e) => {
    setTokenAddress(e.target.value)
  }

  return (
    <Container maxWidth="md">
      <Stack spacing={3} alignItems="center">
        <Typography variant="h3">Your WunderPool</Typography>
        <Collapse in={!ape && !fud}>
          <Stack direction="row" spacing={3}>
            <Button onClick={() => {setApe(true)}} color="success" variant="contained" sx={{width: 300, height: 300}}>So richtig Reinapen</Button>
            <Button onClick={() => {setFud(true)}} color="error" variant="contained" sx={{width: 300, height: 300}}>FUD</Button>
          </Stack>
        </Collapse>
        <Collapse in={ape} sx={{width: "100%"}}>
          <form>
            <Stack width="100%" spacing={3}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h5">APE</Typography>
                <IconButton onClick={() => {setApe(false)}}>
                  <CloseIcon />
                </IconButton>
              </Stack>
              <TextField value={tokenAddress} onChange={handleInput} placeholder="Address"/>
              <Button type="submit" onClick={handleApe} variant="contained">Ape Empfehlung abgeben</Button>
            </Stack>
          </form>
        </Collapse>
        <Collapse in={fud} sx={{width: "100%"}}>
          <Stack width="100%" spacing={3}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h5">FUD</Typography>
              <IconButton onClick={() => {setFud(false)}}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Collapse>
      </Stack>
    </Container>
  )
}