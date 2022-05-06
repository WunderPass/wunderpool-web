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
  const [ape, setApe] = useState(false);
  const [customProposal, setCustomProposal] = useState(false);
  const [fundDialog, setFundDialog] = useState(false);
  const [joinPool, setJoinPool] = useState(false);
  const [userIsMember, setUserIsMember] = useState(null);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
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
        {userIsMember ? (
          <>
            <Collapse in={!ape && !customProposal} sx={{ width: '100%' }}>
              <Stack direction="row" spacing={3} sx={{ width: '100%' }}>
                <button
                  className="btn btn-success w-full"
                  onClick={() => {
                    setApe(true);
                  }}
                >
                  Buy New Token
                </button>
                <button
                  className="btn btn-default w-full"
                  onClick={() => {
                    setCustomProposal(true);
                  }}
                >
                  Custom Proposal
                </button>
              </Stack>
            </Collapse>
            <Collapse in={ape} sx={{ width: '100%', margin: '0 !important' }}>
              <ApeForm
                setApe={setApe}
                address={address}
                fetchProposals={fetchProposals}
                {...props}
              />
            </Collapse>
            <Collapse
              in={customProposal}
              sx={{ width: '100%', margin: '0 !important' }}
            >
              <CustomForm
                customProposal={customProposal}
                setCustomProposal={setCustomProposal}
                poolAddress={address}
                fetchProposals={fetchProposals}
                {...props}
              />
            </Collapse>
            {loading ? (
              <Skeleton
                variant="rectangular"
                width="100%"
                sx={{ height: '100px', borderRadius: 3 }}
              />
            ) : (
              <Collapse in={!customProposal && !ape} sx={{ width: '100%' }}>
                <Stack spacing={3}>
                  <TokenList
                    tokens={tokens}
                    poolAddress={address}
                    fetchProposals={fetchProposals}
                    handleFund={() => setFundDialog(true)}
                    handleWithdraw={() => setWithdrawDialog(true)}
                    poolBalance={poolBalance}
                    {...props}
                  />
                  <NftList
                    nfts={nfts}
                    poolAddress={address}
                    fetchProposals={fetchProposals}
                    {...props}
                  />
                  <ProposalList
                    proposals={proposals}
                    totalGovernanceTokens={totalGovernanceTokens}
                    poolAddress={address}
                    setApe={setApe}
                    fetchProposals={fetchProposals}
                    fetchTokens={fetchTokens}
                    fetchBalance={fetchBalance}
                    {...props}
                  />
                </Stack>
              </Collapse>
            )}
          </>
        ) : userIsMember === false ? (
          <Paper elevation={4} sx={{ width: '100%', p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h5">
                Do you want to join this Pool?
              </Typography>
              <Typography variant="subtitle1">
                Minimum Invest:{' '}
                {governanceTokenData
                  ? toEthString(governanceTokenData.entryBarrier, 6)
                  : '...'}{' '}
                USD
              </Typography>
              <button
                className="btn btn-info"
                variant="contained"
                onClick={() => setJoinPool(true)}
              >
                Join
              </button>
            </Stack>
          </Paper>
        ) : (
          <Skeleton width="100%" height={100} />
        )}
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
