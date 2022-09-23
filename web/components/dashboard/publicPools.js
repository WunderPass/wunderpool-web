import { useEffect, useState } from 'react';
import { fetchAllPools, formatPool } from '/services/contract/pools';
import PoolCard from '../../components/dashboard/poolCard';
import PublicPoolCard from '../../components/dashboard/publicPoolCard';
import { Paper, Typography } from '@mui/material';

export default function PublicPools() {
  const [visiblePools, setVisiblePools] = useState([]);
  const [allPools, setAllPools] = useState([]);

  const canShowMore = allPools.length > visiblePools.length;

  const showMore = () => {
    allPools.slice(visiblePools.length, visiblePools.length + 3).map((pool) => {
      formatPool(pool).then((p) => {
        setVisiblePools((prev) => [...prev, p]);
      });
    });
  };

  useEffect(() => {
    setVisiblePools([]);
    setAllPools([]);
    fetchAllPools().then((pools) => {
      const validPools = pools
        .filter(
          ({ pool_name, active, closed, pool_treasury }) =>
            active &&
            !closed &&
            pool_treasury.act_balance > 3 &&
            !/test/i.test(pool_name)
        )
        .sort(
          (a, b) => b.pool_treasury.act_balance - a.pool_treasury.act_balance
        );
      setAllPools(validPools);

      validPools.slice(0, 3).map((pool) => {
        formatPool(pool).then((p) => {
          setVisiblePools((prev) => [...prev, p]);
        });
      });
    });
  }, []);

  return (
    <div className="">
      <Typography className="subheader subheader-sm font-medium my-6 mt-6">
        Public Pools
      </Typography>
      <div className="flex flex-col w-full md:gap-6 mb-2 md:mb-6 ">
        {visiblePools
          .sort((a, b) => b.totalBalance - a.totalBalance)
          .map((pool, i) => {
            return (
              <div
                key={`public-pool-card-${i}`}
                className="min-w-full sm:min-w-[30%]"
              >
                <div className="sm:hidden flex">
                  <PoolCard pool={pool} />
                </div>
                <div className="hidden sm:flex">
                  <PublicPoolCard pool={pool} />
                </div>
              </div>
            );
          })}
        {canShowMore && (
          <div className="min-w-full sm:min-w-[25%] mb-4 pb-6 sm:p-0 lg:mb-0 sm:mb-6">
            <Paper
              className="container-gray w-full h-full hover:bg-gray-300 cursor-pointer flex items-center justify-center"
              elevation={1}
              sx={{ p: 2 }}
              onClick={showMore}
            >
              <Typography textAlign="center">Show More</Typography>
            </Paper>
          </div>
        )}
      </div>
    </div>
  );
}
