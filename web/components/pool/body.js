import { Collapse, Skeleton, Stack } from '@mui/material';
import ProposalList from '/components/proposals/list';
import ApeForm from '/components/proposals/apeForm';
import CustomForm from '/components/proposals/customForm';
import TokenList from '/components/tokens/list';
import NftList from '/components/tokens/nfts';
import { useState } from 'react';
import React from 'react';
import Members from '/components/pool/members';
import JoinPoolDialog from '/components/dialogs/joinPool';
import AssetDetails from '/components/pool/assetDetails';

function body(props) {
  const { address, loading, wunderPool, loginCallback } = props;

  const [ape, setApe] = useState(false);
  const [customProposal, setCustomProposal] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [joinPool, setJoinPool] = useState(false);

  return (
    <div className="md:ml-4">
      {wunderPool.isMember ? (
        <>
          <Collapse in={ape} sx={{ width: '100%', margin: '0 !important' }}>
            <ApeForm setApe={setApe} wunderPool={wunderPool} {...props} />
          </Collapse>
          <Collapse
            in={customProposal}
            sx={{ width: '100%', margin: '0 !important' }}
          >
            <CustomForm
              customProposal={customProposal}
              setCustomProposal={setCustomProposal}
              poolAddress={address}
              fetchProposals={wunderPool.determineProposals}
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
            //POOL WHEN YOU ARE A MEMBER
            <Collapse in={!customProposal && !ape} sx={{ width: '100%' }}>
              <Stack spacing={3}>
                <TokenList
                  tokens={wunderPool.tokens}
                  poolAddress={address}
                  fetchProposals={wunderPool.determineProposals}
                  handleFund={() => setFundDialog(true)}
                  handleWithdraw={() => setWithdrawDialog(true)}
                  poolBalance={wunderPool.usdcBalance}
                  {...props}
                />
                <NftList
                  nfts={wunderPool.nfts}
                  poolAddress={address}
                  fetchProposals={wunderPool.determineProposals}
                  {...props}
                />
                <ProposalList
                  poolAddress={address}
                  setApe={setApe}
                  wunderPool={wunderPool}
                  {...props}
                />
              </Stack>
            </Collapse>
          )}
        </>
      ) : wunderPool.isMember === false ? ( //POOL BEFORE YOU ARE A MEMBER
        <>
          <Members {...props} />
        </>
      ) : (
        //DEFAULT
        <Skeleton width="100%" height={100} />
      )}
      {wunderPool.governanceToken && (
        <JoinPoolDialog
          open={joinPool}
          setOpen={setJoinPool}
          loginCallback={loginCallback}
          wunderPool={wunderPool}
          {...props}
        />
      )}
    </div>
  );
}

export default body;
