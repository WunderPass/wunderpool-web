import { useEffect, useState, useRef } from 'react';
import { AppBar, Link, Menu, MenuItem, Stack, Toolbar } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Image from 'next/image';
import WunderPoolIcon from '/public/wunderpool_logo_white.svg';
import { usdcBalanceOf } from '/services/contract/token';
import { currency } from '/services/formatter';
import { useRouter } from 'next/router';

export default function Navbar(props) {
  const { user } = props;
  const [usdcBalance, setUsdcBalance] = useState(true);
  const [poolListOpen, setPoolListOpen] = useState(null);
  const { asPath } = useRouter();

  const handleMenuClose = () => {
    setPoolListOpen(null);
  };

  useEffect(() => {
    if (!user.address) return;
    usdcBalanceOf(user.address).then((balance) => {
      setUsdcBalance(balance);
    });
  }, [user.address]);

  if (asPath === '/') return null;

  return (
    <AppBar
      className="bg-gradient-to-r from-wunder-light-blue to-wunder-blue"
      position="static"
    >
      <Toolbar>
        <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
          <Link href="/">
            <a>
              <div className="flex flex-row">
                <div className="pt-0.5 w-44 pr-3">
                  <Image
                    src={WunderPoolIcon}
                    alt="WunderPoolIcon"
                    layout="responsive"
                  />
                </div>
              </div>
            </a>
          </Link>
          {user.loggedIn && (
            <>
              <button onClick={(e) => setPoolListOpen(e.currentTarget)}>
                My Pools
                <ArrowDropDownIcon />
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
                        href={`/pools/${pool.address}?name=${pool.name}`}
                        sx={{ textDecoration: 'none', color: 'inherit' }}
                        passHref
                      >
                        <MenuItem key={`user-pool-${i}`}>{pool.name}</MenuItem>
                      </Link>
                    );
                  })}
                {user.pools.length == 0 && (
                  <MenuItem key="noPools">- no pools -</MenuItem>
                )}
              </Menu>
            </>
          )}
        </Stack>
        {user.loggedIn && (
          <>
            <div className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit p-0.5 my-2 sm:py-1.5 py-3.5">
              <div className="flex flex-row pr-1 text-center items-center text-sm font-bold">
                <p className="mx-2">{currency(usdcBalance, {})}</p>
              </div>
            </div>
            <button
              className="btn ml-2 my-2 sm:py-2.5 py-3.5 hover:bg-[#ff0000] text-sm"
              onClick={user?.logOut}
              variant="contained"
            >
              Log out
            </button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
