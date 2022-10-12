import { useEffect, useState } from 'react';
import { fetchPoolData, formatPool } from '/services/contract/pools';
import PublicPoolCard from '../../components/dashboard/publicPoolCard';
import { Paper, Typography } from '@mui/material';
import axios from 'axios';

export default function PublicPools(props) {
  const { pools } = props;
  const [visiblePools, setVisiblePools] = useState([]);
  const [allPools, setAllPools] = useState([]);
  const [loading, setLoading] = useState(true);

  const canShowMore = allPools.length > visiblePools.length;

  const showMore = () => {
    allPools.slice(visiblePools.length, visiblePools.length + 3).map((pool) => {
      if (pool) setVisiblePools((prev) => [...prev, pool]);
    });
  };

  const getPublicPoolsAddressesFromJson = async () => {
    axios({
      method: 'get',
      url: '/api/pools/public/getAll',
    }).then((res) => {
      getPoolInfoFromBackend([...res.data]);
    });
  };

  const getPoolInfoFromBackend = async (addressArray) => {
    let allpublicPools = await Promise.all(
      addressArray.map((publicPool) => {
        return fetchPoolData(publicPool.poolAddress);
      })
    );

    const validPools = allpublicPools
      .filter(({ active, closed }) => active && !closed)
      .sort(
        (a, b) => b.pool_treasury.act_balance - a.pool_treasury.act_balance
      );

    setAllPools([]);
    setAllPools([...validPools]);
    setVisiblePools([]);
    validPools.slice(0, 3).map((pool) => {
      formatPool(pool).then((p) => {
        if (p) setVisiblePools((prev) => [...prev, p]);
      });
    });
  };

  useEffect(() => {
    getPublicPoolsAddressesFromJson();
  }, []);

  return (
    <>
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
    </>
  );
}
