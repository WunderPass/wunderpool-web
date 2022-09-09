import { Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import React from 'react';
import MakeProposalDialog from '/components/dialogs/makeProposal';
import { currency } from '/services/formatter';
import { GrMoney } from 'react-icons/gr';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';

function assetDetails(props) {
  const { wunderPool } = props;
  const [open, setOpen] = useState(false);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const router = useRouter();

  const handleOpenClose = (onlyClose = false) => {
    if (onlyClose && !open) return;
    if (open) {
      goBack(() => removeQueryParam('makeProposale'));
    } else {
      addQueryParam({ makeProposal: 'buy' }, false);
    }
  };

  useEffect(() => {
    setOpen(router.query?.makeProposal ? true : false);
  }, [router.query]);

  return (
    <>
      {wunderPool.isMember ? (
        <div className="md:ml-4 mt-6 w-full">
          <div className="flex container-white justify-start sm:justify-center mb-4 ">
            <div className="flex flex-col items-center justify-start w-full">
              <Typography className="text-xl w-full">Asset details</Typography>
              <div className="flex lg:flex-row flex-col lg:justify-between w-full">
                <div className="w-full">
                  <Typography className="text-sm opacity-40 py-1 pt-6 font-medium">
                    Total value of assets
                  </Typography>
                  <div className="flex flex-row items-center justify-start ">
                    <GrMoney className="text-xl mr-2" />
                    <Typography className="text-2xl opacity-90 py-1 font-medium">
                      {currency(wunderPool.assetBalance)}
                    </Typography>
                  </div>
                </div>
                <div className="w-full lg:text-right">
                  <Typography className="text-sm opacity-40 py-1 pt-6 font-medium">
                    Amount of assets
                  </Typography>
                  <Typography className="text-2xl opacity-90 py-1 font-medium">
                    {wunderPool.assetCount}
                  </Typography>
                </div>
              </div>

              <button
                className="btn-kaico items-center w-full mb-2 mt-6 py-3 px-3 text-lg"
                onClick={() => {
                  handleOpenClose();
                }}
              >
                Make Proposal
              </button>
            </div>
          </div>
          <MakeProposalDialog
            open={open}
            handleOpenClose={handleOpenClose}
            {...props}
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default assetDetails;
