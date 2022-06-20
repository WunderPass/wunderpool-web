import { Typography } from '@mui/material';

import { useState } from 'react';
import React from 'react';
import MakeProposalDialog from '/components/dialogs/makeProposal';
import { currency } from '/services/formatter';

function assetDetails(props) {
  const { wunderPool } = props;

  const [open, setOpen] = useState(false);

  return (
    <>
      {wunderPool.isMember ? (
        <div className="md:ml-4 mt-6 max-w-4xl">
          <div className="flex container-white justify-start sm:justify-center mb-4 ">
            <div className="flex flex-col items-center justify-start w-full">
              <Typography className="text-xl w-full">Asset details</Typography>
              <div className="flex lg:flex-row flex-col lg:justify-between w-full">
                <div className="w-full">
                  <Typography className="text-sm opacity-40 py-1 pt-6 lg:h-16">
                    Total value of assets
                  </Typography>
                  <Typography className="text-2xl opacity-90 py-1 font-semibold">
                    {currency(wunderPool.assetBalance, {})}
                  </Typography>
                </div>
                <div className="w-full lg:text-right">
                  <Typography className="text-sm opacity-40 py-1 pt-6 lg:h-16">
                    Amount of assets
                  </Typography>
                  <Typography className="text-2xl opacity-90 py-1 font-semibold">
                    {wunderPool.assetCount}
                  </Typography>
                </div>
              </div>

              <button
                className="btn-kaico items-center w-full mb-2 mt-6 py-3 px-3 text-lg"
                onClick={() => {
                  setOpen(true);
                }}
              >
                Make Proposal
              </button>
            </div>
          </div>
          <MakeProposalDialog open={open} setOpen={setOpen} {...props} />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default assetDetails;
