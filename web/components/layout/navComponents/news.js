import React, { useState, useEffect } from 'react';
import { Menu, Badge, Typography, Divider, MenuItem } from '@mui/material';
import { IoMdNotifications } from 'react-icons/io';
import { motion } from 'framer-motion';
import Link from 'next/link';

const axios = require('axios');

const news = (props) => {
  const { user } = props;
  const [newsListOpen, setNewsListOpen] = useState(false);
  const animateFrom = { opacity: 0, y: -40 };
  const animateTo = { opacity: 1, y: 0 };
  const [authorized, setAuthorized] = useState(false);
  const [notifications, setNotifications] = useState(0);

  const checkAuthForClaim = () => {
    axios({
      method: 'get',
      url: '/api/claimable',
      params: { wunderId: user?.wunderId },
    }).then((res) => {
      if (res?.data?.resp) {
        console.log(res?.data?.res);
        setNotifications(1);
      } else {
        setNotifications(0);
      }
      setAuthorized(res?.data?.resp);
    });
  };

  const handleMenuClose = () => {
    setNewsListOpen(false);
  };

  useEffect(() => {
    checkAuthForClaim();
  }, [user]);

  return (
    <>
      <motion.li
        className="py-1 list-none "
        initial={animateFrom}
        animate={animateTo}
        transition={{ delay: 0.05 }}
      >
        <button
          onClick={(e) => setNewsListOpen(e.currentTarget)}
          className={`  ${notifications > 0 ? '' : 'opacity-50'}`}
        >
          <Badge color="red" badgeContent={notifications} max={99}>
            <IoMdNotifications className="text-xl" />
          </Badge>
        </button>
        <Menu
          className="mt-5 "
          open={Boolean(newsListOpen)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          anchorEl={newsListOpen}
          sx={{ borderRadius: '50%' }}
        >
          <Typography className="p-4 text-md">
            You have following notifications
          </Typography>
          <Divider className="mb-2" />

          {authorized && (
            <>
              <Link
                href={`https://app.wunderpass.org/`}
                sx={{ textDecoration: 'none', color: 'inherit' }}
                passHref
              >
                <MenuItem>
                  <Typography className="text-sm">
                    Claim your 50$ in WunderPass
                  </Typography>
                </MenuItem>
              </Link>
            </>
          )}

          {notifications == 0 && <MenuItem> - no notifications - </MenuItem>}
        </Menu>
      </motion.li>
    </>
  );
};

export default news;
