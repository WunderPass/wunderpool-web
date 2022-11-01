import { useState } from 'react';
import { Menu, MenuItem, Chip, Divider } from '@mui/material';
import Link from 'next/link';

const myPools = (props) => {
  const { user, setOpen } = props;
  const [poolListOpen, setPoolListOpen] = useState(null);

  const handleMenuClose = () => {
    setOpen(false);
    setPoolListOpen(null);
  };

  return (
    <>
      <button onClick={(e) => setPoolListOpen(e.currentTarget)}>
        My Pools List
      </button>
      <Menu
        className="mt-4"
        open={Boolean(poolListOpen)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        anchorEl={poolListOpen}
      >
        {user.pools.length > 0 &&
          user.pools.map((pool, i) => {
            return (
              <Link
                key={`user-pool-${i}`}
                href={`/investing/pools/${pool.address}`}
                sx={{ textDecoration: 'none', color: 'inherit' }}
                passHref
              >
                <MenuItem>
                  <div className="flex flex-row items-center justify-between  w-full">
                    <div>{pool.name}</div>
                    <div className="ml-2">
                      <Chip
                        className="items-center hidden sm:flex bg-casama-extra-light-blue text-casama-blue  "
                        size="small"
                        label={(pool.version?.name).toLowerCase()}
                      />
                    </div>
                  </div>
                  <Divider className="my-2 opacity-80 font-black" />
                </MenuItem>
              </Link>
            );
          })}
        {user.pools.length == 0 && <MenuItem> - no pools - </MenuItem>}
      </Menu>{' '}
    </>
  );
};

export default myPools;
