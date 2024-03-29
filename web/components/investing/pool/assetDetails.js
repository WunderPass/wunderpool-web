import { Skeleton, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import React from 'react';
import MakeProposalDialog from '/components/investing/dialogs/makeProposal';
import { currency } from '/services/formatter';
import { GrMoney } from 'react-icons/gr';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';
import BettingGameDialog from '/components/betting/dialogs/bettingGame';

function assetDetails(props) {
  const { wunderPool } = props;
  const [open, setOpen] = useState(false);
  const [openBet, setOpenBet] = useState(false);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const router = useRouter();

  const handleOpenClose = (onlyClose = false) => {
    if (onlyClose && !open) return;
    if (open) {
      goBack(() => removeQueryParam('dialog'));
    } else {
      addQueryParam({ dialog: 'makeProposal' }, false);
    }
  };

  const handleOpenCloseBetting = (onlyClose = false) => {
    if (onlyClose && !openBet) return;
    if (openBet) {
      goBack(() => removeQueryParam('dialog'));
    } else {
      addQueryParam({ dialog: 'newGroupBet' }, false);
    }
  };

  useEffect(() => {
    setOpen(router.query?.dialog == 'makeProposal');
    setOpenBet(router.query?.dialog == 'newGroupBet');
  }, [router.query]);

  return (
    <div className="w-full">
      <div className="flex container-white justify-start sm:justify-center">
        <div className="flex flex-col items-center justify-start w-full">
          <Typography className="text-xl w-full">Asset details</Typography>
          <div className="flex lg:flex-row flex-col lg:justify-between w-full">
            <div className="w-full">
              <Typography className="text-sm opacity-40 py-1 pt-6 font-medium">
                Total value of assets
              </Typography>
              <div className="flex flex-row items-center justify-start ">
                {wunderPool.loadingState.tokens ? (
                  <>
                    <GrMoney className="text-xl mr-2" />
                    <Typography className="text-2xl opacity-90 py-1 font-medium">
                      {currency(wunderPool.assetBalance)}
                    </Typography>
                  </>
                ) : (
                  <Skeleton className="w-full lg:w-1/2 text-2xl opacity-90 py-1 font-medium" />
                )}
              </div>
            </div>
            <div className="w-full lg:text-right">
              <Typography className="text-sm opacity-40 py-1 pt-6 font-medium">
                Amount of assets
              </Typography>
              {wunderPool.loadingState.tokens ? (
                <Typography className="text-2xl opacity-90 py-1 font-medium">
                  {wunderPool.assetCount}
                </Typography>
              ) : (
                <Skeleton className="w-full inline-block lg:w-1/2 text-2xl opacity-90 py-1 font-medium" />
              )}
            </div>
          </div>

          {wunderPool.isMember && (
            <>
              <button
                className="btn-casama items-center w-full mb-2 mt-6 py-3 px-3 text-lg"
                onClick={() => {
                  handleOpenCloseBetting();
                }}
              >
                Start Betting Game
              </button>
              <button
                className="btn-casama-white items-center w-full mb-2 mt-3 py-3 px-3 text-lg"
                onClick={() => {
                  handleOpenClose();
                }}
              >
                Buy Token
              </button>
            </>
          )}
        </div>
      </div>
      <MakeProposalDialog
        open={open}
        handleOpenClose={handleOpenClose}
        {...props}
      />
      <BettingGameDialog
        open={openBet}
        handleOpenClose={handleOpenCloseBetting}
        {...props}
      />
    </div>
  );
}

export default assetDetails;
