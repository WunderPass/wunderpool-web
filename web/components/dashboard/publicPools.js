import { useEffect, useState } from 'react';
import { fetchAllPools, formatPool } from '/services/contract/pools';
import PoolCard from '../../components/dashboard/poolCard';
import PublicPoolCard from '../../components/dashboard/publicPoolCard';
import { Paper, Typography } from '@mui/material';
import axios from 'axios';

export default function PublicPools() {
  const [visiblePools, setVisiblePools] = useState([]);
  const [allPools, setAllPools] = useState([]);

  const canShowMore = allPools.length > visiblePools.length;

  const showMore = () => {
    allPools.slice(visiblePools.length, visiblePools.length + 3).map((pool) => {
      if (pool) setVisiblePools((prev) => [...prev, pool]);
    });
  };

  const getAllPublicPools = async () => {
    axios({
      method: 'get',
      url: '/api/pools/public/getAll',
    }).then((res) => {
      setVisiblePools([]);
      setAllPools([]);
      const orderedPools = res.data.sort(
        (a, b) => b.pool.usdcBalance - a.pool.usdcBalance
      );
      setAllPools(orderedPools);

      setVisiblePools(orderedPools.slice(0, 3));
    });
  };

  useEffect(() => {
    getAllPublicPools();
  }, []);

  return (
    <div className="">
      <Typography className="subheader subheader-sm font-medium my-6 mt-6">
        Public Pools
      </Typography>
      <div className="flex flex-col w-full pb-6 lg:gap-6 md:gap-0.5">
        {visiblePools
          .sort((a, b) => b.totalBalance - a.totalBalance)
          .map((pool) => {
            return (
              <div
                key={`public-pool-card-${pool.poolAddress}`}
                className="min-w-full sm:min-w-[30%]"
              >
                {/* <div className="sm:hidden flex">
                  <PoolCard pool={pool} isPublic={true} />
                </div> */}
                <div className="flex">
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
