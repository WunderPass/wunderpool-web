import { Typography, Skeleton, Tooltip, Link } from '@mui/material';
import { useEffect, useState } from 'react';
import { currency } from '/services/formatter';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import { useRouter } from 'next/router';
import TopUpAlert from '/components/general/dialogs/topUpAlert';

function BettingBox(props) {
  const { user } = props;
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [open, setOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [remainingPoolsBalance, setRemainingPoolsBalance] = useState(0);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const router = useRouter();
  let pools = user.pools;
  const topThree = pools
    .sort((a, b) => b.userBalance - a.userBalance)
    .slice(0, 4);
  const cashInPools = pools
    .map((p) => p.userBalance)
    .reduce((a, b) => a + b, 0);

  useEffect(() => {
    pools = user.pools;
  }, [user.pools]);

  useEffect(() => {
    const topThreeTogether = topThree
      .map((p) => p.userBalance)
      .slice(0, 3)
      .reduce((a, b) => a + b, 0);
    setRemainingPoolsBalance(cashInPools - topThreeTogether);
  }, [cashInPools, user.usdBalance]);

  function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
  }
  const handleOpenClose = () => {
    if (open) {
      goBack(() => removeQueryParam('dialog'));
    } else {
      addQueryParam({ dialog: 'createPool' }, false);
    }
  };

  useEffect(() => {
    if (open) setRedirectUrl(new URL(document.URL));
  }, [open]);

  useEffect(() => {
    setOpen(router.query?.dialog ? true : false);
  }, [router.query]);

  useEffect(() => {
    if (user.usdBalance) {
      setTotalBalance(cashInPools);
    }
  }, [user.usdBalance, cashInPools]);

  useEffect(() => {
    if (user.isReady) {
      setLoading(false);
    }
  }, [user.isReady]);

  return !loading ? (
    <>
      <div className="sm:h-full sm:max-h-96 ">
        <div className="flex sm:h-full flex-col justify-between container-white mb-1 m:mr-8 w-full ">
          <div>
            <div className="flex flex-row justify-between">
              <Typography className="pb-6 text-2xl">Open Bets</Typography>
              <Typography className="text-2xl ">1</Typography>
            </div>

            {true > 0 ? ( //TODO
              <></>
            ) : (
              <>
                <div className="flex flex-col w-full ">
                  {user.usdBalance == 0 && (
                    <div>
                      <div className="flex flex-row items-center">
                        <Typography className="pt-5 py-1">
                          No cash yet to create bets, please top up your account
                          to continue{' '}
                        </Typography>
                      </div>

                      <button
                        className="btn-casama w-full mt-5 py-4 px-3 text-md cursor-pointer transition-colors"
                        onClick={() => setTopUpOpen(true)}
                      >
                        Manage Funds
                      </button>
                    </div>
                  )}
                </div>
                <TopUpAlert
                  open={topUpOpen}
                  setOpen={setTopUpOpen}
                  user={user}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  ) : (
    <Skeleton
      variant="rectangular"
      width="100%"
      sx={{ height: '100px', borderRadius: 3 }}
    />
  );
}

export default BettingBox;
