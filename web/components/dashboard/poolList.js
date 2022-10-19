import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { MdGroups } from 'react-icons/md';
import { Typography } from '@mui/material';
import AdvancedPoolDialog from '/components/dialogs/advancedPool/dialog';
import UseAdvancedRouter from '/hooks/useAdvancedRouter';
import PoolCard from '/components/dashboard/poolCard';

export default function PoolList(props) {
  const { pools } = props;
  const [open, setOpen] = useState(false);
  const { addQueryParam, removeQueryParam, goBack } = UseAdvancedRouter();
  const router = useRouter();

  const handleOpenClose = () => {
    if (open) {
      goBack(() => removeQueryParam('createPool1'));
    } else {
      addQueryParam({ createPool1: 'createPool1' }, false);
    }
  };

  useEffect(() => {
    setOpen(router.query?.createPool1 ? true : false);
  }, [router.query]);

  return pools.length > 0 ? (
    <div className="lg:grid lg:grid-cols-2 lg:gap-6 w-full">
      {pools.map((pool, i) => {
        return <PoolCard key={`pool-card-${pool.address}`} pool={pool} />;
      })}
    </div>
  ) : (
    <div className="container-white">
      <div className="flex flex-col items-center ">
        <div className="border-solid text-casama-blue rounded-full bg-casama-extra-light-blue p-5 my-2 mt-6 mb-4">
          <MdGroups className="text-4xl" />
        </div>
        <div className="my-2 mb-10">
          <Typography variant="h7">
            Get invited to an investment pool or start one and invite others in
            minutes
          </Typography>
          <div className="flex justify-center mt-2 cursor-pointer">
            <a
              href={`https://www.youtube.com/watch?v=vz6rXuKOyZ4`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Typography className="text-casama-blue justify-center">
                (See Demo)
              </Typography>
            </a>
          </div>
        </div>
        <button
          className="btn-casama-white items-center w-full my-5 py-3.5 px-3 mb-0 text-md "
          onClick={handleOpenClose}
        >
          Create your first pool
        </button>
      </div>
      <AdvancedPoolDialog open={open} setOpen={handleOpenClose} {...props} />
    </div>
  );
}
