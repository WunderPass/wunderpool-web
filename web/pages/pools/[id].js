import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Stack } from '@mui/material';
import FundPoolDialog from '/components/dialogs/fundPoolDialog';
import PoolHeader from '/components/pool/header';
import PoolBody from '/components/pool/body';
import usePool from '/hooks/usePool';
import PoolDetails from '/components/pool/assetDetails';
import PoolMembers from '/components/pool/members';

export default function Pool(props) {
  const router = useRouter();
  const {
    setupPoolListener,
    user,
    tokenAddedEvent,
    votedEvent,
    newProposalEvent,
    proposalExecutedEvent,
    resetEvents,
  } = props;
  const [address, setAddress] = useState(null);
  const [name, setName] = useState('');
  const [fundDialog, setFundDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const wunderPool = usePool(user.address, address);

  const loginCallback = () => {
    setupPoolListener(address);
    // window.location.reload();
  };

  useEffect(() => {}, [wunderPool.totalBalance]);

  useEffect(() => {
    if (wunderPool.isReady && wunderPool.poolAddress) {
      if (wunderPool.exists) {
        if (wunderPool.isMember) {
          loginCallback();
          setLoading(false);
        }
      } else {
        router.push('/pools');
      }
    }
  }, [wunderPool.isReady, wunderPool.isMember]);

  useEffect(() => {
    if (wunderPool.liquidated) {
      router.push('/pools');
    }
  }, [wunderPool.liquidated]);

  useEffect(() => {
    if (router.isReady) {
      setAddress(router.query.id);
      setName(router.query.name);
      wunderPool.setPoolAddress(router.query.id);
    }
  }, [router.isReady, router.query.id]);

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
      wunderPool.determineProposals();
      resetEvents();
    }
  }, [votedEvent, newProposalEvent, proposalExecutedEvent]);

  return (
    <Container className="flex justify-center items-center" maxWidth="xl">
      <Stack className="flex-col" paddingTop={2} style={{ maxWidth: '100%' }}>
        <div
          className="hidden md:flex md:flex-row" //Desktop
        >
          <div className="md:flex md:flex-col max-w-4xl">
            <PoolHeader
              name={name}
              address={address}
              wunderPool={wunderPool}
              {...props}
            />
            <PoolBody
              address={address}
              loading={loading}
              wunderPool={wunderPool}
              tokenAddedEvent={tokenAddedEvent}
              newProposalEvent={newProposalEvent}
              {...props}
            />
          </div>{' '}
          <div className="flex-col max-w-2xl">
            {!wunderPool.isMember && <></>}
            <PoolDetails address={address} wunderPool={wunderPool} {...props} />
            <PoolMembers
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
            <PoolHeader name={name} address={address} wunderPool={wunderPool} />

            <PoolDetails address={address} wunderPool={wunderPool} {...props} />
            <PoolMembers
              address={address}
              wunderPool={wunderPool}
              loginCallback={loginCallback}
              {...props}
            />

            <PoolBody
              address={address}
              loading={loading}
              wunderPool={wunderPool}
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
  );
}
