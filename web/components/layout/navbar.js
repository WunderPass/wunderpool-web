import { useEffect, useState, useRef } from 'react';
import { AppBar, Link, Menu, MenuItem, Stack, Toolbar } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Image from 'next/image';
import WunderPoolIcon from '/public/wunderpool_logo_white.svg';
import UserIcon from '/public/user.png';
import { usdcBalanceOf } from '/services/contract/token';
import { currency } from '/services/formatter';
import { useRouter } from 'next/router';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import MobileNavigation from './mobileNavigation';
import Navigation from './navigation';

export default function Navbar(props) {
  const { user } = props;
  const [usdcBalance, setUsdcBalance] = useState(true);
  const [poolListOpen, setPoolListOpen] = useState(null);
  const { asPath } = useRouter();

  const handleMenuClose = () => {
    setPoolListOpen(null);
  };

  useEffect(() => {
    if (!user.usdBalance) return;
    setUsdcBalance(user?.usdBalance);
  }, [user.usdBalance]);

  if (asPath === '/') return null;

  return (
    <>
      <AppBar className="bg-kaico-blue" position="fixed" sx={{ top: 0 }}>
        <Toolbar>
          <Stack className="flex flex-row w-full justify-between items-center">
            <Link href="/">
              <div className="flex flex-row">
                <div className="hidden pt-0.5 w-44 pr-3 sm:block">
                  <Image
                    src={WunderPoolIcon}
                    alt="WunderPoolIcon"
                    layout="responsive"
                  />
                </div>

                <div className="flex-col justify-between border-solid w-9 h-9 ml-1 border-white rounded-full bg-white shadow-xl block sm:hidden">
                  <Image src={UserIcon} alt="UserIcon" layout="responsive" />
                </div>
              </div>
            </Link>
            {user.loggedIn && (
              <>
                <Navigation {...props} />
                <MobileNavigation {...props} />
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
}
