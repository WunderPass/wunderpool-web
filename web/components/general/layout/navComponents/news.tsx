import { useState } from 'react';
import { Menu, Badge, MenuItem, ListItemIcon } from '@mui/material';
import { IoMdNotifications } from 'react-icons/io';
import RedeemIcon from '@mui/icons-material/Redeem';
import { motion } from 'framer-motion';
import { UseUserType } from '../../../../hooks/useUser';

type NewsProps = {
  user: UseUserType;
};

export default function News(props: NewsProps) {
  const { user } = props;
  const [open, setOpen] = useState<Element>();
  const animateFrom = { opacity: 0, y: -40 };
  const animateTo = { opacity: 1, y: 0 };

  const handleMenuClose = () => {
    setOpen(undefined);
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
          onClick={(e) => setOpen(e.currentTarget)}
          className={user.notifications.length > 0 ? '' : 'opacity-50'}
        >
          <Badge
            color="error"
            badgeContent={user.notifications.length}
            max={99}
          >
            <IoMdNotifications className="text-xl" />
          </Badge>
        </button>
        <Menu
          className="mt-5 "
          open={Boolean(open)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          anchorEl={open}
          sx={{ borderRadius: '50%' }}
        >
          {user.notifications.map((notification) => {
            return (
              <MenuItem
                key={`notification-${notification.type}`}
                onClick={notification.action}
              >
                <ListItemIcon>
                  <RedeemIcon fontSize="small" />
                </ListItemIcon>
                {notification.text}
              </MenuItem>
            );
          })}

          {user.notifications.length == 0 && (
            <MenuItem> - no notifications - </MenuItem>
          )}
        </Menu>
      </motion.li>
    </>
  );
}
