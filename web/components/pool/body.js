import { Collapse, Skeleton, Typography, Divider } from '@mui/material';
import ProposalList from '/components/proposals/list';
import CustomForm from '/components/proposals/customForm';
import TokenList from '/components/tokens/list';
import NftList from '/components/tokens/nfts';
import { useState, useEffect } from 'react';
import React from 'react';
import AssetDetails from '/components/pool/assetDetails';

function body(props) {
  const { address, loading, wunderPool, tokenAddedEvent, newProposalEvent } =
    props;

  const [ape, setApe] = useState(false);
  const [customProposal, setCustomProposal] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [isProposalTab, setIsProposalTab] = useState(true);
  const [isAssetTab, setIsAssetTab] = useState(false);
  const [isNftTab, setIsNftTab] = useState(false);

  const activateAssetTab = () => {
    setIsAssetTab(true);
    setIsProposalTab(false);
    setIsNftTab(false);
  };

  const activateProposalTab = () => {
    setIsProposalTab(true);
    setIsAssetTab(false);
    setIsNftTab(false);
  };

  const activateNftTab = () => {
    setIsNftTab(true);
    setIsProposalTab(false);
    setIsAssetTab(false);
  };

  useEffect(() => {
    if (!tokenAddedEvent) return;
    if (tokenAddedEvent.nft) {
      activateNftTab();
    } else {
      activateAssetTab();
    }
  }, [tokenAddedEvent]);

  useEffect(() => {
    if (!newProposalEvent) return;
    activateProposalTab();
  }, [newProposalEvent]);

  return (
    <div className="mt-4 mb-8">
      {wunderPool.isMember ? ( //POOL WHEN YOU ARE A MEMBER
        <>
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
            <>
              <div className="flex container-white ">
                <div className="flex flex-col w-full">
                  <div className="flex flex-row justify-start items-center w-full">
                    <button
                      className={
                        isProposalTab ? 'py-4 pr-4' : 'py-4 pr-4 opacity-40 '
                      }
                      onClick={activateProposalTab}
                    >
                      <div className="flex flex-row items-center justify-center">
                        <Typography>Proposals</Typography>
                      </div>
                    </button>
                    <button
                      className={
                        isAssetTab
                          ? ' py-4 pr-4 pl-4'
                          : 'opacity-40 py-4 pr-4 pl-4'
                      }
                      onClick={activateAssetTab}
                    >
                      <div className="flex flex-row items-center justify-center">
                        <Typography>Assets</Typography>
                      </div>
                    </button>
                    <button
                      className={
                        isNftTab
                          ? 'py-4 pr-4 pl-4'
                          : 'py-4 pr-4 pl-4 opacity-40'
                      }
                      onClick={activateNftTab}
                    >
                      <div className="flex flex-row items-center justify-center">
                        <Typography>NFT's</Typography>
                      </div>
                    </button>
                  </div>
                  <Divider className="mb-6 mt-1 opacity-70" />

                  {isProposalTab && (
                    <ProposalList
                      poolAddress={address}
                      setApe={setApe}
                      wunderPool={wunderPool}
                      {...props}
                    />
                  )}
                  {isAssetTab && (
                    <TokenList
                      tokens={wunderPool.tokens}
                      poolAddress={address}
                      fetchProposals={wunderPool.determineProposals}
                      handleFund={() => setFundDialog(true)}
                      handleWithdraw={() => setWithdrawDialog(true)}
                      poolBalance={wunderPool.usdcBalance}
                      {...props}
                    />
                  )}
                  {isNftTab && (
                    <NftList
                      nfts={wunderPool.nfts}
                      poolAddress={address}
                      fetchProposals={wunderPool.determineProposals}
                      {...props}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </>
      ) : !wunderPool.isMember ? ( //POOL BEFORE YOU ARE A MEMBER
        <></>
      ) : (
        //DEFAULT
        <Skeleton width="100%" height={100} />
      )}
    </div>
  );
}

export default body;
