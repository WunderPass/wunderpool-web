import { useEffect, useState } from 'react';
import { Link, Menu, MenuItem } from '@mui/material';
import { currency } from '/services/formatter';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { AiOutlineClose } from 'react-icons/ai';
import { GiHamburgerMenu } from 'react-icons/gi';

const mobileNavigation = (props) => {
  const { user } = props;
  const [poolListOpen, setPoolListOpen] = useState(null);
  const [usdcBalance, setUsdcBalance] = useState(true);
  const [open, setOpen] = useState(null);

  const handleMenuClose = () => {
    setPoolListOpen(null);
  };

  useEffect(() => {
    if (!user.usdBalance) return;
    setUsdcBalance(user?.usdBalance);
  }, [user.usdBalance]);

  const hamburgerIcon = (
    <GiHamburgerMenu className="text-3xl ml-2.5"> </GiHamburgerMenu>
  );
  const closeIcon = (
    <AiOutlineClose className="text-3xl ml-2.5"></AiOutlineClose>
  );

  useEffect(() => {
    if (!user.usdBalance) return;
    setUsdcBalance(user?.usdBalance);
  }, [user.usdBalance]);

  return (
    <>
      <div className="block sm:hidden pt-1">
        <div className="flex flex-row">
          <div
            onClick={() => user.setTopUpRequired(true)}
            className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit mx-2 p-0.5 my-2 py-1.5 cursor-pointer"
          >
            <div className="flex flex-row pr-1 text-center items-center text-sm font-bold">
              <p className="mx-2">{currency(usdcBalance, {})}</p>
              <BsFillPlusCircleFill className="text-xl mr-1" />
            </div>
          </div>
          <button className="sm:block text-sm" onClick={() => setOpen(!open)}>
            {open ? closeIcon : hamburgerIcon}
          </button>
        </div>
        {open && (
          <div>
            <ul className="flex flex-col justify-between absolute top-13 left-0 bg-kaico-blue w-full border-t-2 border-white align-right pl-1">
              <li className="px-2 py-1 pt-2">
                <button onClick={(e) => setPoolListOpen(e.currentTarget)}>
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
                  {user.pools.length == 0 && (
                    <MenuItem> - no pools - </MenuItem>
                  )}
                </Menu>{' '}
              </li>

              <li className="px-2 py-1">
                <a href="/">Profile</a>
              </li>

              <button
                className="btn ml-2 my-2 py-1 hover:bg-[#ff0000] text-sm w-20"
                onClick={user?.logOut}
              >
                Log out
              </button>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default mobileNavigation;
