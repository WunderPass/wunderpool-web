import { useState } from 'react';
import { Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import Link from 'next/link';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DangerousIcon from '@mui/icons-material/Dangerous';
import DestroyPoolDialog from '/components/dialogs/destroyPool';
import PoolInfoDialog from '/components/dialogs/poolInfo';

export default function PoolHeader(props) {
  const { name, address, governanceTokenData, userIsMember, fetchProposals } =
    props;
  const [poolInfo, setPoolInfo] = useState(false);
  const [destroyDialog, setDestroyDialog] = useState(false);

  return (
    <>
      <Grid container alignItems="center">
        <Grid item xs={12} sm={2}>
          <Link href={`/pools`} passHref>
            <button className="btn btn-default">
              <ArrowBackIosIcon fontSize="inherit" />
              All Pools
            </button>
          </Link>
        </Grid>
        <Grid item xs={12} sm={8} textAlign="center">
          <Stack direction="row" alignItems="center" justifyContent="center">
            <Typography variant="h4">{name}</Typography>
            {governanceTokenData && (
              <Tooltip title="Pool Info">
                <IconButton color="info" onClick={() => setPoolInfo(true)}>
                  <InfoOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Grid>
        {userIsMember && (
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
      </Grid>
      {governanceTokenData && (
        <PoolInfoDialog
          open={poolInfo}
          setOpen={setPoolInfo}
          name={name}
          address={address}
          governanceTokenData={governanceTokenData}
          {...props}
        />
      )}
      <DestroyPoolDialog
        open={destroyDialog}
        setOpen={setDestroyDialog}
        address={address}
        name={name}
        fetchProposals={fetchProposals}
        {...props}
      />
    </>
  );
}
