import { useEffect, useState } from 'react';
import {
  Link,
  Menu,
  MenuItem,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import { currency } from '/services/formatter';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { IoMdNotifications } from 'react-icons/io';
import { HiOutlineLogout } from 'react-icons/hi';
import { motion } from 'framer-motion';

const navigation = (props) => {
  const { user } = props;
  const [poolListOpen, setPoolListOpen] = useState(null);
  const [notificationListOpen, setNotificationListOpen] = useState(null);
  const animateFrom = { opacity: 0, y: -40 };
  const animateTo = { opacity: 1, y: 0 };

  const handleMenuClose = () => {
    setPoolListOpen(null);
    setNotificationListOpen(null);
  };

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
              className="mt-4"
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
          {user.whitelistedPools.length > 0 && (
            <div className="flex w-5 h-5 bg-red-500 text-white text-sm mb-7 -mr-12 z-50 rounded-full  items-center justify-center">
              <Typography className="text-sm">
                {user.whitelistedPools.length}
              </Typography>
            </div>
          )}

          <motion.li
            className="px-2 py-1 pt-2"
            initial={animateFrom}
            animate={animateTo}
            transition={{ delay: 0.05 }}
          >
            <button
              onClick={(e) => setNotificationListOpen(e.currentTarget)}
              className="px-2 opacity-50"
            >
              <IoMdNotifications className="text-xl" />
            </button>
            <Menu
              className="mt-5"
              open={Boolean(notificationListOpen)}
              onClose={handleMenuClose}
              anchorEl={notificationListOpen}
            >
              <Typography className="p-4 text-xl">
                You were invited to join these Pools
              </Typography>
              <Divider className="mb-2" />
              {user.whitelistedPools.length > 0 &&
                user.whitelistedPools
                  .slice(0)
                  .reverse()
                  .map((pool, i) => {
                    return (
                      <Link
                        key={`pool-${i}`}
                        href={`/pools/${pool.address}?name=${pool.name}`}
                        sx={{ textDecoration: 'none', color: 'inherit' }}
                        passHref
                      >
                        <MenuItem> {pool.name}</MenuItem>
                      </Link>
                    );
                  })}
              {user.pools.length == 0 && <MenuItem> - no pools - </MenuItem>}
            </Menu>
          </motion.li>

          <div
            onClick={() => user.setTopUpRequired(true)}
            className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit mx-2 p-0.5 my-2 py-1.5 cursor-pointer"
          >
            <div className="flex flex-row pr-1 text-center items-center text-sm ">
              <p className="mx-2">{currency(user?.usdBalance, {})}</p>
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
