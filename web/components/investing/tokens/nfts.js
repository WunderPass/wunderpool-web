import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import SellNftDialog from '/components/investing/dialogs/sellNftDialog';
import Nft from './nft';

export default function NftList(props) {
  const { nfts } = props;
  const [open, setOpen] = useState(false);

  return (
    <Stack spacing={2}>
      {nfts.map((nft) => {
        return (
          <Paper elevation={1} key={`nft-${nft.address}`} sx={{ p: 2 }}>
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
      <div className="container-gray">
        <Typography className="text-2xl mb-2">Do you own an NFT?</Typography>
        <Typography variant="subtitle1">
          Then you can sell it to the Pool. If all members agree that you made
          them a fair offer, they might agree to buy your NFT
        </Typography>
        <button
          className="btn-casama w-full p-2 mt-4"
          variant="contained"
          onClick={() => setOpen(true)}
        >
          Sell Your NFT
        </button>
      </div>
      <SellNftDialog open={open} setOpen={setOpen} {...props} />
    </Stack>
  );
}