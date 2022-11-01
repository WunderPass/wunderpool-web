import { useState } from 'react';
import { Menu, MenuItem, Typography, Divider, Badge } from '@mui/material';
import { HiUserGroup } from 'react-icons/hi';
import { motion } from 'framer-motion';
import Link from 'next/link';

const poolInvites = (props) => {
  const { user } = props;
  const [notificationListOpen, setNotificationListOpen] = useState(null);
  const animateFrom = { opacity: 0, y: -40 };
  const animateTo = { opacity: 1, y: 0 };

  const handleMenuClose = () => {
    setNotificationListOpen(null);
  };

  return (
    <>
      <motion.li
        className="py-1 list-none "
        initial={animateFrom}
        animate={animateTo}
        transition={{ delay: 0.05 }}
      >
        <button
          onClick={(e) => setNotificationListOpen(e.currentTarget)}
          className={` ${user.whitelistedPools.length > 0 ? '' : 'opacity-50'}`}
        >
          <Badge
            color="red"
            badgeContent={user.whitelistedPools.length}
            max={99}
          >
            <HiUserGroup className="text-xl" />
          </Badge>
        </button>
        <Menu
          className="mt-5 "
          open={Boolean(notificationListOpen)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
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
                    href={`/pools/join/${pool.address}`}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                    passHref
                  >
                    <MenuItem>
                      <Typography className="text-sm">{pool.name}</Typography>{' '}
                    </MenuItem>
                  </Link>
                );
              })}
          {user.whitelistedPools.length == 0 && (
            <MenuItem> - no invites - </MenuItem>
          )}
        </Menu>
      </motion.li>
    </>
  );
};

export default poolInvites;
