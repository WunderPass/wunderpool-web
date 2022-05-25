import { useState } from 'react';
import { Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import Link from 'next/link';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DangerousIcon from '@mui/icons-material/Dangerous';
import DestroyPoolDialog from '/components/dialogs/destroyPool';
import PoolInfoDialog from '/components/dialogs/poolInfo';
import { currency, usdc } from '/services/formatter';

export default function PoolHeader(props) {
  const { name, address, wunderPool } = props;
  const [poolInfo, setPoolInfo] = useState(false);
  const [destroyDialog, setDestroyDialog] = useState(false);

  return (
    <>
      <Grid container alignItems="center">
        <Grid item xs={12} sm={2}>
          <Link href={`/pools`} passHref>
            <button className="">
              <ArrowBackIosIcon fontSize="inherit" />
              All Pools
            </button>
          </Link>
        </Grid>
        <Grid item xs={12} sm={8} textAlign="center">
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Typography variant="h4">{name}</Typography>
            {wunderPool.governanceToken && (
              <Tooltip title="Pool Info">
                <IconButton color="info" onClick={() => setPoolInfo(true)}>
                  <InfoOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Grid>

        {wunderPool.isMember && (
          <Grid item xs={12} sm={2}>
            <Stack direction="row" alignItems="center" justifyContent="right">
              <Tooltip title="Liquidate Pool">
                <IconButton
                  color="error"
                  onClick={() => setDestroyDialog(true)}
                >
                  <DangerousIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        )}
        <Grid item className="w-full ">
          <Stack direction="row" className=" justify-center">
            <Typography className="self-center " variant="h4">
              Pool Balance:{' '}
              {currency(wunderPool.usdcBalance?.toString() / 1000000, {})}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
      {wunderPool.governanceToken && (
        <PoolInfoDialog
          open={poolInfo}
          setOpen={setPoolInfo}
          name={name}
          address={address}
          governanceTokenData={wunderPool.governanceToken}
          {...props}
        />
      )}
      <DestroyPoolDialog
        open={destroyDialog}
        setOpen={setDestroyDialog}
        address={address}
        name={name}
        wunderPool={wunderPool}
        {...props}
      />
    </>
  );
}
