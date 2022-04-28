import { Button, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";

export default function NftList(props) {
  const { nfts } = props;
  return (
    nfts.length > 0 && (
      <Stack spacing={3} pt={2}>
        <Typography variant="h4">NFTs</Typography>
        {nfts.map((nft) => {
          return (
            <Paper elevation={3} key={`nft-${nft.address}`} sx={{ p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack spacing={1}>
                  <Typography variant="h6">{nft.name}</Typography>
                  {nft.uris.map((tokenUri) => {
                    return (
                      <Typography
                        key={`nft-uri-${tokenUri}`}
                        variant="subtitle1"
                      >
                        {tokenUri}
                      </Typography>
                    );
                  })}
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Button color="error" disabled={token.balance == 0}>
                    Sell
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    )
  );
}
