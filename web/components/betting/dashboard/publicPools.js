import { useEffect, useState } from 'react';
import { formatPool } from '/services/contract/pools';
import PublicPoolCard from '/components/betting/dashboard/publicPoolCard';

import { Paper, Skeleton, Typography } from '@mui/material';
import axios from 'axios';

export default function PublicPools({ user }) {
  const [visiblePools, setVisiblePools] = useState([]);
  const [allPools, setAllPools] = useState([]);
  const [loading, setLoading] = useState(true);

  const canShowMore = allPools.length > visiblePools.length;

  const showMore = async () => {
    setLoading(true);
    await Promise.all(
      allPools
        .slice(visiblePools.length, visiblePools.length + 3)
        .map((pool) => {
          formatPool(pool).then((p) => {
            if (p) setVisiblePools((prev) => [...prev, p]);
          });
        })
    );
    setLoading(false);
  };

  const getPublicPoolsAddressesFromJson = async () => {
    setLoading(true);
    try {
      const { data } = await axios({
        method: 'get',
        url: '/api/pools/all',
        params: { public: true },
      });
      const userPools = user.pools.map((pool) => pool.address);
      const filteredPools = data.filter(
        (pool) => !userPools.includes(pool.pool_address)
      );
      setAllPools(filteredPools);
      await Promise.all(
        filteredPools.slice(0, 3).map((pool) => {
          formatPool(pool).then((p) => {
            if (p) setVisiblePools((prev) => [...prev, p]);
          });
        })
      );
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user.isReady) return;
    setVisiblePools([]);
    setAllPools([]);
    getPublicPoolsAddressesFromJson();
  }, [user.isReady]);

  return (
    <>
      <div className="">
        <Typography className="subheader subheader-sm font-medium my-6">
          Public Pools
        </Typography>
        <div className="flex flex-col w-full pb-6 lg:gap-4 md:gap-0.5">
          {visiblePools
            .sort((a, b) => b.totalBalance - a.totalBalance)
            .map((pool) => {
              return (
                <div
                  key={`public-pool-card-${pool.address}`}
                  className="min-w-full sm:min-w-[30%]"
                >
                  <div className="flex">
                    <PublicPoolCard pool={pool} />
                  </div>
                </div>
              );
            })}
          {loading && (
            <Skeleton
              variant="rectangular"
              height={150}
              className="rounded-xl"
            />
          )}

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
    </>
  );
}
