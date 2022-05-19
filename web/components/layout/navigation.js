import { useEffect, useState } from 'react';
import { Link, Menu, MenuItem } from '@mui/material';
import { currency } from '/services/formatter';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { IoMdNotifications } from 'react-icons/io';

const navigation = (props) => {
  const { user } = props;
  const [poolListOpen, setPoolListOpen] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(true);

  const handleMenuClose = () => {
    setPoolListOpen(null);
  };

  useEffect(() => {
    if (!user.usdBalance) return;
    setUsdcBalance(user?.usdBalance);
  }, [user.usdBalance]);

  return (
    <div className="hidden sm:block">
      <ul className="flex flex-row justify-between items-center">
        <li className="px-2">
          <button
            className="hidden sm:block font-semibold"
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
        <li className="px-2 font-semibold">
          <a href="/pools">Profile </a>
        </li>
        <div className="px-2 opacity-50">
          <IoMdNotifications className="text-xl" />
        </div>
        <div
          onClick={() => user.setTopUpRequired(true)}
          className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit mx-2 p-0.5 my-2 py-1.5 cursor-pointer"
        >
          <div className="flex flex-row pr-1 text-center items-center text-sm font-bold">
            <p className="mx-2">{currency(usdcBalance, {})}</p>
            <BsFillPlusCircleFill className="text-xl mr-1" />
          </div>
        </div>

        <button
          className="hidden sm:block btn ml-2 my-2 py-1.5 hover:bg-[#ff0000] text-sm"
          onClick={user?.logOut}
        >
          Log out
        </button>
      </ul>
    </div>
  );
};

export default navigation;
