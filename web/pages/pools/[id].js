import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Stack } from '@mui/material';
import FundPoolDialog from '/components/dialogs/fundPoolDialog';
import PoolHeader from '/components/pool/header';
import PoolBody from '/components/pool/body';
import usePool from '/hooks/usePool';

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
  };

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
    if (router.isReady) {
      setAddress(router.query.id);
      setName(router.query.name);
      wunderPool.setPoolAddress(router.query.id);
    }
  }, [router.isReady]);

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
    if (!votedEvent || votedEvent?.voter == user.address) return;
    if (!newProposalEvent || newProposalEvent?.creator == user.address) return;
    if (
      !proposalExecutedEvent ||
      proposalExecutedEvent?.executor == user.address
    )
      return;
    wunderPool.determineProposals();
    resetEvents();
  }, [votedEvent, newProposalEvent, proposalExecutedEvent]);

  return (
    <Container maxWidth="md">
      <Stack
        spacing={3}
        alignItems="center"
        paddingTop={2}
        style={{ maxWidth: '100%' }}
      >
        <div className="flex flex-col sm:flex-row">
          <PoolHeader name={name} address={address} wunderPool={wunderPool} />
          <PoolBody
            address={address}
            loading={loading}
            wunderPool={wunderPool}
            loginCallback={loginCallback}
            {...props}
          />
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
