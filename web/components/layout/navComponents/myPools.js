import { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
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
        My Pools
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
                href={`/pools/${pool.address}?name=${pool.name.replaceAll(
                  '&',
                  '%26'
                )}`}
                sx={{ textDecoration: 'none', color: 'inherit' }}
                passHref
              >
                <MenuItem>
                  {pool.name} ({pool.version?.name})
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
