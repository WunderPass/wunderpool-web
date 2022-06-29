import { useState } from 'react';
import { Menu, Badge } from '@mui/material';
import { IoMdNotifications } from 'react-icons/io';
import { motion } from 'framer-motion';
import { GiFalloutShelter } from 'react-icons/gi';

const news = (props) => {
  const { user } = props;
  const [newsListOpen, setNewsListOpen] = useState(false);
  const animateFrom = { opacity: 0, y: -40 };
  const animateTo = { opacity: 1, y: 0 };

  const handleMenuClose = () => {
    setNewsListOpen(null);
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
          onClick={(e) => setNewsListOpen(e.currentTarget)}
          className={`  ${false ? '' : 'opacity-50'}`}
        >
          <Badge color="red" badgeContent={0} max={99}>
            <IoMdNotifications className="text-xl" />
          </Badge>
        </button>

        <Menu
          className={`py-2 pt-2 rounded-full`}
          open={newsListOpen}
          onClose={handleMenuClose}
          anchorEl={newsListOpen}
        >
          The content of the Popover.
        </Menu>
      </motion.li>
    </>
  );
};

export default news;
