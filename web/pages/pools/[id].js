import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Button,
  Collapse,
  Container,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DangerousIcon from "@mui/icons-material/Dangerous";
import DestroyPoolDialog from "/components/dialogs/destroyPool";
import FundPoolDialog from "/components/dialogs/fundPoolDialog";
import PoolInfoDialog from "/components/dialogs/poolInfo";
import JoinPoolDialog from "/components/dialogs/joinPool";
import { fetchPoolProposals } from "/services/contract/proposals";
import { fetchPoolTokens } from "/services/contract/token";
import {
  fetchPoolName,
  fetchPoolBalance,
  isMember,
} from "/services/contract/pools";
import { fetchPoolGovernanceToken } from "/services/contract/token";
import ProposalList from "/components/proposals/list";
import ApeForm from "/components/proposals/apeForm";
import CustomForm from "/components/proposals/customForm";
import TokenList from "/components/tokens/list";
import { toEthString } from "/services/formatter";

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
  const [poolInfo, setPoolInfo] = useState(false);
  const [joinPool, setJoinPool] = useState(false);
  const [userIsMember, setUserIsMember] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [destroyDialog, setDestroyDialog] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [tokens, setTokens] = useState([]);
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

  const fetchBalance = () => {
    fetchPoolBalance(address).then((res) => {
      setPoolBalance(res);
    });
  };

  const checkPoolExistence = () => {
    return fetchPoolName(address);
  };

  useEffect(() => {
    if (address && user.address) {
      checkPoolExistence()
        .then(() => {
          fetchGovernanceTokenData();
          fetchBalance();
          isMember(address, user.address).then((res) => {
            if (res) {
              setUserIsMember(true);
              setupPoolListener(address);
              fetchProposals();
              fetchTokens();
            } else {
              setUserIsMember(false);
            }
          });
        })
        .catch(() => {
          router.push("/pools");
        });
    }
  }, [address, user.address]);

  useEffect(() => {
    fetchTokens();
  }, [tokenAddedEvent]);

  useEffect(() => {
    if (votedEvent?.voter && votedEvent.voter == user.address) return;
    if (newProposalEvent?.creator && newProposalEvent.creator == user.address)
      return;
    if (
      proposalExecutedEvent?.executor &&
      proposalExecutedEvent.executor == user.address
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
        sx={{ width: "100%" }}
      >
        <Grid container alignItems="center">
          <Grid item xs={12} sm={2}>
            <Link href={`/pools`} passHref>
              <Button startIcon={<ArrowBackIosIcon />}>All Pools</Button>
            </Link>
          </Grid>
          <Grid item xs={12} sm={8} textAlign="center">
            <Stack direction="row" alignItems="center" justifyContent="center">
              <Typography variant="h4">{name}</Typography>
              {governanceTokenData && (
                <IconButton color="info" onClick={() => setPoolInfo(true)}>
                  <InfoOutlinedIcon />
                </IconButton>
              )}
            </Stack>
          </Grid>
          {userIsMember && (
            <Grid item xs={12} sm={2}>
              <Stack direction="row" alignItems="center" justifyContent="right">
                <IconButton
                  color="error"
                  onClick={() => setDestroyDialog(true)}
                >
                  <DangerousIcon />
                </IconButton>
              </Stack>
            </Grid>
          )}
        </Grid>
        {userIsMember ? (
          <>
            <Collapse in={!ape && !customProposal} sx={{ width: "100%" }}>
              <Stack direction="row" spacing={3} sx={{ width: "100%" }}>
                <Button
                  onClick={() => {
                    setApe(true);
                  }}
                  color="success"
                  variant="contained"
                  sx={{ width: "100%", minHeight: 150, aspectRatio: "2/1" }}
                >
                  So richtig Reinapen
                </Button>
                <Button
                  onClick={() => {
                    setCustomProposal(true);
                  }}
                  variant="contained"
                  sx={{ width: "100%", minHeight: 150, aspectRatio: "2/1" }}
                >
                  Eigenes Proposal
                </Button>
              </Stack>
            </Collapse>
            <Collapse in={ape} sx={{ width: "100%" }}>
              <ApeForm
                setApe={setApe}
                address={address}
                fetchProposals={fetchProposals}
                {...props}
              />
            </Collapse>
            <Collapse in={customProposal} sx={{ width: "100%" }}>
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
                sx={{ height: "100px", borderRadius: 3 }}
              />
            ) : (
              <Collapse in={!customProposal && !ape} sx={{ width: "100%" }}>
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
                <TokenList
                  tokens={tokens}
                  poolAddress={address}
                  fetchProposals={fetchProposals}
                  handleFund={() => setFundDialog(true)}
                  handleWithdraw={() => setWithdrawDialog(true)}
                  poolBalance={poolBalance}
                  {...props}
                />
              </Collapse>
            )}
          </>
        ) : (
          <Paper elevation={4} sx={{ width: "100%", p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h5">
                Do you want to join this Pool?
              </Typography>
              <Typography variant="subtitle1">
                Minimum Invest:{" "}
                {governanceTokenData
                  ? toEthString(governanceTokenData.entryBarrier, 6)
                  : "..."}{" "}
                USD
              </Typography>
              <Button variant="contained" onClick={() => setJoinPool(true)}>
                Join
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>
      <FundPoolDialog
        open={fundDialog}
        setOpen={setFundDialog}
        address={address}
        {...props}
      />
      <DestroyPoolDialog
        open={destroyDialog}
        setOpen={setDestroyDialog}
        address={address}
        name={name}
        fetchProposals={fetchProposals}
        {...props}
      />
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
      {governanceTokenData && (
        <JoinPoolDialog
          open={joinPool}
          setOpen={setJoinPool}
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
