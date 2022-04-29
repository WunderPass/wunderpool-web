import { Button, Grid, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import SellNftDialog from "../dialogs/sellNftDialog";
import Nft from "./nft";

export default function NftList(props) {
  const { nfts } = props;
  const [open, setOpen] = useState(false);

  return nfts.length > 0 ? (
    <Stack spacing={3} pt={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">NFTs</Typography>
        <Button onClick={() => setOpen(true)}>Sell Your NFT</Button>
      </Stack>
      {nfts.map((nft) => {
        return (
          <Paper elevation={3} key={`nft-${nft.address}`} sx={{ p: 2 }}>
            <Typography variant="h6">{nft.name}</Typography>
            <Grid container>
              {nft.tokens.map((token) => {
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={4}
                    xl={3}
                    p={1}
                    key={`nft-${token.uri}`}
                  >
                    <Nft
                      uri={token.uri}
                      address={nft.address}
                      tokenId={token.id}
                      {...props}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        );
      })}
      <SellNftDialog open={open} setOpen={setOpen} {...props} />
    </Stack>
  ) : (
    <Button
      variant="contained"
      sx={{ my: 4 }}
      fullWidth
      onClick={() => setOpen(true)}
    >
      Sell Your NFT
    </Button>
  );
}
