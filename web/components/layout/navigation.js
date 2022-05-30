import { useEffect, useState } from 'react';
import { Link, Menu, MenuItem } from '@mui/material';
import { currency } from '/services/formatter';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { IoMdNotifications } from 'react-icons/io';
import { HiOutlineLogout } from 'react-icons/hi';

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
    <div className="hidden sm:block w-full">
      <ul className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-row justify-start">
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
            <a href="/pools">Profile </a>
          </li>
        </div>
        <div className="flex flex-row items-center justify-end">
          <div className="px-2 opacity-50">
            <IoMdNotifications className="text-xl" />
          </div>
          <div
            onClick={() => user.setTopUpRequired(true)}
            className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit mx-2 p-0.5 my-2 py-1.5 cursor-pointer"
          >
            <div className="flex flex-row pr-1 text-center items-center text-sm ">
              <p className="mx-2">{currency(usdcBalance, {})}</p>
              <BsFillPlusCircleFill className="text-xl mr-1" />
            </div>
          </div>

          <button
            className="hidden sm:block text-2xl pl-2 hover:text-red-500"
            onClick={user?.logOut}
          >
            <HiOutlineLogout />
          </button>
        </div>
      </ul>
    </div>
  );
};

export default navigation;
