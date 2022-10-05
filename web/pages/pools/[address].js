import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Stack } from '@mui/material';
import FundPoolDialog from '/components/dialogs/fundPoolDialog';
import PoolHeader from '/components/pool/header';
import PoolBody from '/components/pool/body';
import usePool from '/hooks/usePool';
import PoolDetails from '/components/pool/assetDetails';
import PoolMembers from '/components/pool/members';
import { currency } from '/services/formatter';
import { fetchPoolName } from '/services/contract/pools';
import CustomHeader from '../../components/utils/customHeader';

export default function Pool(props) {
  const router = useRouter();
  const {
    setupPoolListener,
    user,
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
  const [name, setName] = useState('');
  const [fundDialog, setFundDialog] = useState(false);
  const wunderPool = usePool(user.address, address, handleError);

  const loginCallback = () => {
    setupPoolListener(address, user.address);
    // window.location.reload();
  };

  const reactToEvent = () => {
    if (!address || !user.address) return;
    if (
      votedEvent &&
      votedEvent?.voter.toLowerCase() == user.address.toLowerCase()
    )
      return;
    if (
      newProposalEvent &&
      newProposalEvent?.creator.toLowerCase() == user.address.toLowerCase()
    )
      return;
    if (
      proposalExecutedEvent &&
      proposalExecutedEvent?.executor.toLowerCase() ==
        user.address.toLowerCase()
    )
      return;
    if (votedEvent || newProposalEvent || proposalExecutedEvent) {
      if (proposalExecutedEvent) {
        fetchPoolName(address)
          .then(() => {
            wunderPool.determineProposals();
            wunderPool.determinePoolData();
          })
          .catch(() => {
            handleInfo('Pool was closed.');
            user.fetchUsdBalance();
            router.push('/pools');
          });
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
      setName(router.query.name);
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
    if (process.env.NODE_ENV == 'development') window.wunderPool = wunderPool;
  }, []);

  return (
    <>
      <CustomHeader
        title={metaTagInfo.title}
        description={metaTagInfo.description}
        imageUrl={metaTagInfo.imageUrl}
      />
      <Container
        className={`${wunderPool.loadingState.init ? '' : 'blur'}`}
        maxWidth="xl"
      >
        <Stack className="flex-col" paddingTop={2} style={{ maxWidth: '100%' }}>
          <div
            className="hidden md:flex md:flex-row" //Desktop
          >
            <div className="md:flex md:flex-col max-w-4xl w-screen">
              <PoolHeader
                name={name}
                address={address}
                wunderPool={wunderPool}
                isMobile={false}
                {...props}
              />
              <PoolBody
                setupPoolListener={setupPoolListener}
                address={address}
                wunderPool={wunderPool}
                tokenAddedEvent={tokenAddedEvent}
                newProposalEvent={newProposalEvent}
                {...props}
              />
            </div>
            <div className="flex-col max-w-sm w-screen">
              <PoolDetails
                address={address}
                wunderPool={wunderPool}
                {...props}
              />
              <PoolMembers
                user={user}
                address={address}
                wunderPool={wunderPool}
                loginCallback={loginCallback}
                {...props}
              />
            </div>
          </div>

          <div
            className="block md:hidden" //Mobile
          >
            <div className="flex-col ">
              <PoolHeader
                name={name}
                address={address}
                wunderPool={wunderPool}
                isMobile={true}
                {...props}
              />
              <PoolDetails
                address={address}
                wunderPool={wunderPool}
                {...props}
              />
              <PoolMembers
                address={address}
                wunderPool={wunderPool}
                loginCallback={loginCallback}
                {...props}
              />
              <PoolBody
                address={address}
                wunderPool={wunderPool}
                tokenAddedEvent={tokenAddedEvent}
                newProposalEvent={newProposalEvent}
                loginCallback={loginCallback}
                {...props}
              />
            </div>
          </div>
        </Stack>

        <FundPoolDialog
          open={fundDialog}
          setOpen={setFundDialog}
          address={address}
          {...props}
        />
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

    const balance = currency(pool_treasury.act_balance);

    return {
      props: {
        metaTagInfo: {
          title: `Casama - ${pool_name} - ${balance}`,
          description: pool_description,
          imageUrl: `/api/pools/metadata/ogImage?address=${address}&name=${pool_name}&balance=${balance}&maxMembers=${shareholder_agreement.max_members}&members=${pool_members.length}`,
        },
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
      },
    };
  }
}
