import { MdGroups } from 'react-icons/md';
import { Typography } from '@mui/material';
import PoolCard from './poolCard';

export default function PoolList(props) {
  const { pools, setOpen } = props;

  return pools.length > 0 ? (
    <div className="lg:grid lg:grid-cols-2 lg:gap-6 w-full">
      {pools.map((pool, i) => {
        return <PoolCard key={`pool-card-${i}`} pool={pool} />;
      })}
    </div>
  ) : (
    <div className="container-white">
      <div className="flex flex-col items-center ">
        <div className="border-solid text-kaico-blue rounded-full bg-kaico-extra-light-blue p-5 my-2 mt-6 mb-4">
          <MdGroups className="text-4xl" />
        </div>
        <Typography className="my-2 mb-10" variant="h7">
          No Pools joined yet
        </Typography>
        <button
          className="btn-kaico-white items-center w-full my-5 py-3 px-3 mb-8 text-md "
          onClick={() => setOpen(true)}
        >
          Create pool
        </button>
      </div>
    </div>
  );
}
