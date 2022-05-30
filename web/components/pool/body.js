import { Collapse, Paper, Skeleton, Stack, Typography } from '@mui/material';
import ProposalList from '/components/proposals/list';
import ApeForm from '/components/proposals/apeForm';
import CustomForm from '/components/proposals/customForm';
import TokenList from '/components/tokens/list';
import { toEthString } from '/services/formatter';
import NftList from '/components/tokens/nfts';
import { useState, useEffect } from 'react';
import React from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import JoinPoolDialog from '/components/dialogs/joinPool';

function body(props) {
  const { address, loading, wunderPool, loginCallback } = props;

  const [ape, setApe] = useState(false);
  const [customProposal, setCustomProposal] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [joinPool, setJoinPool] = useState(false);

  return (
    <div className="sm:ml-4">
      {wunderPool.isMember ? (
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
            </Stack>
          </Collapse>
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
        <div className="flex container-white justify-start sm:justify-center mb-4">
          <div className="flex flex-col items-center justify-center ">
            <Typography className="text-xl w-full">Members</Typography>
            <div className="flex flex-col ">
              <div className="flex flex-row w-full mt-2">
                <div className="flex border-solid text-black rounded-full bg-green-400 w-10 h-10 items-center justify-center border-2 border-white">
                  <Typography>AR</Typography>
                </div>
                <div className="flex border-solid text-black rounded-full bg-red-400 w-10 h-10 items-center justify-center -ml-3 border-2 border-white">
                  <Typography>JF </Typography>
                </div>
                <div className="flex border-solid text-black rounded-full bg-blue-300 w-10 h-10 items-center justify-center -ml-3 border-2 border-white">
                  <Typography>DP</Typography>
                </div>
              </div>
              <Typography className="my-2 sm:mt-4 " variant="h7">
                6 Wunderpass friends and 10 other members are in the pool.
              </Typography>
            </div>
            <button
              className="btn-kaico items-center w-full my-5 py-3 px-3 text-md "
              onClick={() => setJoinPool(true)}
            >
              <div className="flex flex-row items-center justify-center">
                <AiOutlinePlus className=" text-xl" />
                <Typography className="ml-2">Join</Typography>
              </div>
            </button>
          </div>
        </div>
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
