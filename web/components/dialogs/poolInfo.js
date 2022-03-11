import { Dialog, DialogContent, DialogContentText, DialogTitle, Divider, Grid, Link, Slide, Stack, Typography } from "@mui/material";
import { forwardRef, Fragment, useState } from "react";
import { toEthString } from "../../services/formatter";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function PoolInfoDialog(props) {
  const {open, setOpen, name, address, governanceTokenData} = props;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} TransitionComponent={Transition} fullWidth>
      <DialogTitle sx={{textAlign: 'center'}}>{name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Typography variant="subtitle1">Address:</Typography>
            <Link target="_blank" href={`https://polygonscan.com/address/${address}`}>{address}</Link>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Typography variant="subtitle1">Entry Barrier:</Typography>
            <Typography variant="subtitle1">{toEthString(governanceTokenData.entryBarrier, 18)} MATIC</Typography>
          </Stack>
          <Typography variant="h6" textAlign="center">Governance Token</Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Typography variant="subtitle1">Name:</Typography>
            <Typography variant="subtitle1">{governanceTokenData.name} ({governanceTokenData.symbol})</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Typography variant="subtitle1">Price Per Token:</Typography>
            <Typography variant="subtitle1">{toEthString(governanceTokenData.price, 18)} MATIC</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Typography variant="subtitle1">Total Supply:</Typography>
            <Typography variant="subtitle1">{governanceTokenData.totalSupply.toString()}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Typography variant="subtitle1">Address:</Typography>
            <Link target="_blank" href={`https://polygonscan.com/token/${governanceTokenData.address}`}>{governanceTokenData.address}</Link>
          </Stack>
          <Typography variant="h6" textAlign="center">Members</Typography>
          <Grid container>
            <Grid item xs={5}>Address</Grid>
            <Grid item xs={4} textAlign="right">Tokens</Grid>
            <Grid item xs={3} textAlign="right">Share</Grid>
            {governanceTokenData.holders.map((holder, i) => {
              return (
                <Fragment key={`proposal-${i}`}>
                <Grid item xs={5} pt={1} pb={1} borderTop="1px solid gray">{holder.address.substr(0,4)}...{holder.address.substr(-4,4)}</Grid>
                <Grid item xs={4} pt={1} pb={1} borderTop="1px solid gray" textAlign="right">{holder.tokens.toString()}</Grid>
                <Grid item xs={3} pt={1} pb={1} borderTop="1px solid gray" textAlign="right">{holder.share.toString()}%</Grid>
                </Fragment>
              )
            })}
          </Grid>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}