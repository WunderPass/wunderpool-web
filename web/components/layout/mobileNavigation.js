import { useEffect, useState } from 'react';
import { Link, Menu, MenuItem, Typography, Divider } from '@mui/material';
import { currency } from '/services/formatter';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { AiOutlineClose } from 'react-icons/ai';
import { GiHamburgerMenu } from 'react-icons/gi';
import { IoMdNotifications } from 'react-icons/io';
import { motion } from 'framer-motion';

const mobileNavigation = (props) => {
  const { user } = props;
  const [poolListOpen, setPoolListOpen] = useState(null);
  const [notificationListOpen, setNotificationListOpen] = useState(null);
  const [open, setOpen] = useState(false);
  const animateFrom = { opacity: 0, y: -40 };
  const animateTo = { opacity: 1, y: 0 };

  const handleMenuClose = () => {
    setNotificationListOpen(null);
    setPoolListOpen(null);
  };

  const hamburgerIcon = (
    <GiHamburgerMenu className="text-3xl ml-2.5"> </GiHamburgerMenu>
  );
  const closeIcon = (
    <AiOutlineClose className="text-3xl ml-2.5"></AiOutlineClose>
  );

  return (
    <>
      <div className="block sm:hidden pt-1">
        <div className="flex flex-row items-center">
          {user.whitelistedPools.length > 0 && (
            <div className="flex w-5 h-5 bg-red-500 text-white text-sm mb-7 -mr-12 z-50 rounded-full  items-center justify-center">
              <Typography className="text-sm">
                {user.whitelistedPools.length}
              </Typography>
            </div>
          )}

          <motion.li
            className="px-2 py-1 pt-2 list-none"
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
              className="mt-5 "
              open={Boolean(notificationListOpen)}
              onClose={handleMenuClose}
              anchorEl={notificationListOpen}
              sx={{ borderRadius: '50%' }}
            >
              <Typography className="p-4 text-md">
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
                        <MenuItem>
                          <Typography className="text-sm">
                            {pool.name}
                          </Typography>{' '}
                        </MenuItem>
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

          <button className="sm:block text-sm" onClick={() => setOpen(!open)}>
            {open ? closeIcon : hamburgerIcon}
          </button>
        </div>
        {open && (
          <div>
            <ul className="flex flex-col justify-between absolute top-13 left-0 bg-kaico-blue w-full border-t-2  border-t-white align-right pl-1 shadow-xl">
              <motion.li
                className="px-2 py-1 pt-2"
                initial={animateFrom}
                animate={animateTo}
                transition={{ delay: 0.05 }}
              >
                <button onClick={(e) => setPoolListOpen(e.currentTarget)}>
                  My Pools
                </button>
                <Menu
                  className="mt-5"
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
                  {user.pools.length == 0 && (
                    <MenuItem> - no pools - </MenuItem>
                  )}
                </Menu>{' '}
              </motion.li>

              <motion.li
                className="px-2 py-1"
                initial={animateFrom}
                animate={animateTo}
                transition={{ delay: 0.1 }}
              >
                <a href="/pools">Profile</a>
              </motion.li>

              <motion.li
                initial={animateFrom}
                animate={animateTo}
                transition={{ delay: 0.2 }}
              >
                <button
                  className="ml-2 pb-2 py-1 hover:text-[#ff0000]"
                  onClick={user?.logOut}
                >
                  Log out
                </button>
              </motion.li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default mobileNavigation;
