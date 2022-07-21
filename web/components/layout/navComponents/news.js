import React, { useState, useEffect } from 'react';
import { Menu, Badge, Divider, MenuItem, ListItemIcon } from '@mui/material';
import { IoMdNotifications } from 'react-icons/io';
import RedeemIcon from '@mui/icons-material/Redeem';
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
    if (user?.wunderId) checkAuthForClaim();
  }, [user?.wunderId]);

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
          className={notifications > 0 ? '' : 'opacity-50'}
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
          {authorized && (
            <Link
              href={`https://app.wunderpass.org/`}
              sx={{ textDecoration: 'none', color: 'inherit' }}
              passHref
            >
              <MenuItem>
                <ListItemIcon>
                  <RedeemIcon fontSize="small" />
                </ListItemIcon>
                Claim 50$ for your WunderPass NFT
              </MenuItem>
            </Link>
          )}

          {notifications == 0 && <MenuItem> - no notifications - </MenuItem>}
        </Menu>
      </motion.li>
    </>
  );
};

export default news;
