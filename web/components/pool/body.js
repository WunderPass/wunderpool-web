import { Collapse, Paper, Skeleton, Stack, Typography } from '@mui/material';
import ProposalList from '/components/proposals/list';
import ApeForm from '/components/proposals/apeForm';
import CustomForm from '/components/proposals/customForm';
import TokenList from '/components/tokens/list';
import { toEthString } from '/services/formatter';
import NftList from '/components/tokens/nfts';
import { useState, useEffect } from 'react';
import React from 'react';

function body(props) {
  const {
    userIsMember,
    isDemoPool,
    address,
    proposals,
    tokens,
    nfts,
    loading,
    governanceTokenData,
    totalGovernanceTokens,
    poolBalance,
    fetchProposals,
    fetchTokens,
    fetchBalance,
  } = props;

  const [ape, setApe] = useState(false);
  const [customProposal, setCustomProposal] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);

  return (
    <>
      {!isDemoPool ? (
        //If its not a demo pool
        <>
          {userIsMember ? (
            //if the user is already a member of the pool
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
                //if you are a member of the pool and it has not loaded
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  sx={{ height: '100px', borderRadius: 3 }}
                />
              ) : (
                //if you are a member of the pool and it has loaded
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
            //if you havent joined the pool and are yet to become a member
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
            //DEFAULT, should never be reached
            <Skeleton width="100%" height={100} />
          )}
        </>
      ) : (
        //if the pool is only a demoPool
        <>
          {userIsMember ? (
            //if the user is already a member of the pool
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
                //if you are a member of the pool and it has not loaded
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  sx={{ height: '100px', borderRadius: 3 }}
                />
              ) : (
                //if you are a member of the pool and it has loaded
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
            //if you havent joined the pool and are yet to become a member
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
            //DEFAULT, should never be reached
            <Skeleton width="100%" height={100} />
          )}
        </>
      )}
    </>
  );
}

export default body;
