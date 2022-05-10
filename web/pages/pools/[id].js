import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Collapse,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import FundPoolDialog from '/components/dialogs/fundPoolDialog';
import JoinPoolDialog from '/components/dialogs/joinPool';
import { fetchPoolProposals } from '/services/contract/proposals';
import { fetchPoolTokens, fetchPoolNfts } from '/services/contract/token';
import {
  fetchPoolName,
  fetchPoolBalance,
  isMember,
} from '/services/contract/pools';
import { fetchPoolGovernanceToken } from '/services/contract/token';
import ProposalList from '/components/proposals/list';
import ApeForm from '/components/proposals/apeForm';
import CustomForm from '/components/proposals/customForm';
import TokenList from '/components/tokens/list';
import { toEthString } from '/services/formatter';
import NftList from '/components/tokens/nfts';
import PoolHeader from '/components/pool/header';
import PoolBody from '/components/pool/body';

export default function Pool(props) {
  const router = useRouter();
  const { id: address, name } = router.query;
  const {
    setupPoolListener,
    user,
    tokenAddedEvent,
    votedEvent,
    newProposalEvent,
    proposalExecutedEvent,
    resetEvents,
  } = props;
  const [fundDialog, setFundDialog] = useState(false);
  const [joinPool, setJoinPool] = useState(false);
  const [userIsMember, setUserIsMember] = useState(null);
  const [isDemoPool, setIsDemoPool] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [governanceTokenData, setGovernanceTokenData] = useState(null);
  const [totalGovernanceTokens, setTotalGovernanceTokens] = useState(null);
  const [poolBalance, setPoolBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchGovernanceTokenData = () => {
    fetchPoolGovernanceToken(address, user.address).then((gt) => {
      setGovernanceTokenData(gt);
      setTotalGovernanceTokens(gt.totalSupply);
    });
  };

  const fetchProposals = () => {
    setLoading(true);
    fetchPoolProposals(address).then((ps) => {
      setProposals(ps);
      setLoading(false);
    });
  };

  const fetchTokens = () => {
    fetchPoolTokens(address).then((ts) => {
      setTokens(ts);
    });
  };

  const fetchNfts = () => {
    fetchPoolNfts(address).then((ts) => {
      setNfts(ts);
    });
  };

  const fetchBalance = () => {
    fetchPoolBalance(address).then((res) => {
      setPoolBalance(res);
    });
  };

  const checkPoolExistence = () => {
    return fetchPoolName(address);
  };

  const loginCallback = () => {
    setUserIsMember(true);
    setupPoolListener(address);
    fetchProposals();
    fetchTokens();
    fetchNfts();
  };

  useEffect(() => {
    if (address && user.address) {
      checkPoolExistence()
        .then(() => {
          fetchGovernanceTokenData();
          fetchBalance();
          isMember(address, user.address).then((res) => {
            if (res) {
              loginCallback();
            } else {
              setUserIsMember(false);
            }
          });
        })
        .catch(() => {
          router.push('/pools');
        });
    }
  }, [address, user.address]);

  useEffect(() => {
    if (!address || !user.address) return;
    if (!tokenAddedEvent) return;
    if (tokenAddedEvent.nft) {
      fetchNfts();
    } else {
      fetchTokens();
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
    fetchProposals();
    resetEvents();
  }, [votedEvent, newProposalEvent, proposalExecutedEvent]);

  return (
    <Container maxWidth="md">
      <Stack
        spacing={3}
        alignItems="center"
        paddingTop={2}
        sx={{ width: '100%' }}
      >
        <PoolHeader
          name={name}
          address={address}
          governanceTokenData={governanceTokenData}
          userIsMember={userIsMember}
          fetchProposals={fetchProposals}
          poolBalance={poolBalance}
        />
        <PoolBody
          userIsMember={userIsMember}
          isDemoPool={isDemoPool}
          address={address}
          proposals={proposals}
          tokens={tokens}
          nfts={nfts}
          loading={loading}
          governanceTokenData={governanceTokenData}
          totalGovernanceTokens={totalGovernanceTokens}
          poolBalance={poolBalance}
          fetchProposals={fetchProposals}
          fetchTokens={fetchTokens}
          fetchBalance={fetchBalance}
          {...props}
        />
      </Stack>
      <FundPoolDialog
        open={fundDialog}
        setOpen={setFundDialog}
        address={address}
        {...props}
      />
      {governanceTokenData && (
        <JoinPoolDialog
          open={joinPool}
          setOpen={setJoinPool}
          loginCallback={loginCallback}
          address={address}
          price={governanceTokenData.price}
          totalSupply={governanceTokenData.totalSupply}
          minimumInvest={governanceTokenData.entryBarrier}
          {...props}
        />
      )}
    </Container>
  );
}
