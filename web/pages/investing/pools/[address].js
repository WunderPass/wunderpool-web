import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Grid, Stack } from '@mui/material';
import FundPoolDialog from '/components/general/dialogs/fundPoolDialog';
import PoolHeader from '/components/investing/pool/header';
import PoolBody from '/components/investing/pool/body';
import usePool from '/hooks/usePool';
import PoolDetails from '/components/investing/pool/assetDetails';
import PoolMembers from '/components/investing/pool/members';
import { currency } from '/services/formatter';
import CustomHeader from '/components/general/utils/customHeader';

export default function Pool(props) {
  const router = useRouter();
  const {
    updateListener,
    user,
    poolName,
    metaTagInfo,
    tokenAddedEvent,
    votedEvent,
    newProposalEvent,
    newMemberEvent,
    proposalExecutedEvent,
    resetEvents,
    handleInfo,
    handleError,
  } = props;
  const [address, setAddress] = useState(null);
  const [fundDialog, setFundDialog] = useState(false);
  const wunderPool = usePool(user.address, address, handleError);

  const loginCallback = () => {
    updateListener(user.pools, address, user.address);
    // window.location.reload();
  };

  const reactToEvent = () => {
    if (votedEvent || newProposalEvent || proposalExecutedEvent) {
      if (proposalExecutedEvent) {
        if (proposalExecutedEvent.proposal_action == 'LIQUIDATE_POOL') {
          handleInfo('Pool was closed.');
          user.fetchUsdBalance();
          router.push('/pools');
        } else {
          wunderPool.determineProposals();
          wunderPool.determinePoolData();
        }
      } else {
        wunderPool.determineProposals();
      }
    }
  };

  useEffect(() => {
    if (wunderPool.isReady && wunderPool.poolAddress) {
      if (wunderPool.exists) {
        if (wunderPool.isMember) {
          loginCallback();
        }
      } else if (wunderPool.exists === false) {
        handleInfo('Pool was closed');
        user.fetchUsdBalance();
        router.push('/pools');
      }
    }
  }, [wunderPool.isReady, wunderPool.isMember, wunderPool.exists]);

  useEffect(() => {
    if (wunderPool.liquidated) {
      handleInfo('Pool was closed.');
      user.fetchUsdBalance();
      router.push('/pools');
    }
  }, [wunderPool.liquidated]);

  useEffect(() => {
    if (router.isReady && router.query.address && user.address) {
      setAddress(router.query.address);
      wunderPool.setPoolAddress(router.query.address);
      wunderPool.setUserAddress(user.address);
    }
  }, [router.isReady, router.query.address, user.address]);

  useEffect(() => {
    if (!address || !user.address) return;
    if (!tokenAddedEvent) return;
    if (tokenAddedEvent.nft) {
      wunderPool.determineNfts();
    } else {
      wunderPool.determineTokens();
    }
    resetEvents();
  }, [tokenAddedEvent]);

  useEffect(() => {
    if (!address || !user.address) return;
    if (!newMemberEvent) return;
    wunderPool.determinePoolData();
    wunderPool.determineBalance();
    resetEvents();
  }, [newMemberEvent]);

  useEffect(() => {
    reactToEvent();
    resetEvents();
  }, [votedEvent, newProposalEvent, proposalExecutedEvent]);

  useEffect(() => {
    // For Debugging - Access wunderPool in your console
    if (wunderPool.isReady && process.env.NODE_ENV == 'development')
      window.wunderPool = wunderPool;
  }, [wunderPool.isReady]);

  return (
    <>
      <CustomHeader
        title={metaTagInfo.title}
        description={metaTagInfo.description}
        imageUrl={metaTagInfo.imageUrl}
      />
      <Container
        className={`${wunderPool.loadingState.init ? '' : 'blur'} my-4`}
        maxWidth="xl"
      >
        <Grid container spacing={2} sx={{ position: 'relative' }}>
          <Grid item xs={12} md={8}>
            <PoolHeader
              name={poolName}
              address={address}
              wunderPool={wunderPool}
              isMobile={false}
              {...props}
            />
          </Grid>
          <Grid
            item
            container
            spacing={2}
            xs={12}
            md={4}
            sx={{
              position: { md: 'absolute' },
              right: 0,
            }}
          >
            <Grid item xs={12}>
              <PoolDetails
                address={address}
                wunderPool={wunderPool}
                {...props}
              />
            </Grid>
            <Grid item xs={12}>
              <PoolMembers
                user={user}
                address={address}
                wunderPool={wunderPool}
                loginCallback={loginCallback}
                {...props}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} md={8}>
            <PoolBody address={address} wunderPool={wunderPool} {...props} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  const address = context.query.address;

  try {
    const {
      pool_name,
      pool_description,
      pool_treasury,
      pool_members,
      shareholder_agreement,
    } = await (
      await fetch(`https://app.casama.io/api/pools/show?address=${address}`)
    ).json();

    const balance = currency(pool_treasury?.act_balance || 0);

    return {
      props: {
        metaTagInfo: {
          title: `Casama - ${pool_name} - ${balance}`,
          description: pool_description,
          imageUrl: `/api/pools/metadata/ogImage?address=${address}&name=${pool_name}&balance=${balance}&maxMembers=${
            shareholder_agreement?.max_members || 1
          }&members=${pool_members?.length || 1}`,
        },
        poolName: pool_name,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        metaTagInfo: {
          title: 'Casama',
          imageUrl: `/api/pools/metadata/ogImage?address=${address}&name=Casama`,
        },
        poolName: 'Unknown Pool',
      },
    };
  }
}
