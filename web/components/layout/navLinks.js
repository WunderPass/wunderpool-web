import { useEffect, useState, useRef } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { AppBar, Link, Menu, MenuItem, Stack, Toolbar } from '@mui/material';

const NavLinks = (props) => {
  const { user } = props;

  const [poolListOpen, setPoolListOpen] = useState(null);

  const handleMenuClose = () => {
    setPoolListOpen(null);
  };

  return (
    <ul className="flex flex-row justify-between pt-1">
      <li className="px-2">
        <button
          className="hidden sm:block"
          onClick={(e) => setPoolListOpen(e.currentTarget)}
        >
          My Pools
        </button>
        <Menu
          open={Boolean(poolListOpen)}
          onClose={handleMenuClose}
          anchorEl={poolListOpen}
        >
          {user.pools.length > 0 &&
            user.pools.map((pool, i) => {
              return (
                <Link
                  key={`user-pool-${i}`}
                  href={`/pools/${pool.address}?name=${pool.name}`}
                  sx={{ textDecoration: 'none', color: 'inherit' }}
                  passHref
                >
                  <MenuItem>{pool.name}</MenuItem>
                </Link>
              );
            })}
          {user.pools.length == 0 && <MenuItem> - no pools - </MenuItem>}
        </Menu>{' '}
      </li>
      <li className="px-2">
        <a href="/">Home2 </a>
      </li>
      <li className="px-2">
        <a href="/">Home3 </a>
      </li>
      <button
        className="hidden sm:block btn hover:bg-[#ff0000] text-sm"
        onClick={user?.logOut}
      >
        Log out
      </button>
    </ul>
  );
};

export default NavLinks;
