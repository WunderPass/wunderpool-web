import {
  BottomNavigation,
  BottomNavigationAction,
  ClickAwayListener,
  Collapse,
  Divider,
  Paper,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useState } from 'react';
import Avatar from '/components/general/members/avatar';
import HomeIcon from '@mui/icons-material/Home';
import AppsIcon from '@mui/icons-material/Apps';
import { AiOutlineInsertRowBelow } from 'react-icons/ai';
import { RiGroup2Fill } from 'react-icons/ri';
import { ImUngroup } from 'react-icons/im';
import { FaWallet } from 'react-icons/fa';
import Link from 'next/link';
import CasamaLogo from '/public/casama_logo_white.png';
import Image from 'next/image';

export default function BottomBar(props) {
  const { user } = props;
  const [value, setValue] = useState();
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const toggleMenuButton = () => {
    setShowMenu(!showMenu);
  };

  const determineAction = (action) => {};

  useEffect(() => {}, [router, showMenu]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* //just css for menu */}
      <div
        className="flex items-center justify-center w-full bg-black"
        style={{
          opacity: showMenu ? '100' : '0',
          transition: 'visibility 0s, opacity 0.2s linear',
        }}
      >
        {/* Bottom Circle */}
        <div className="fixed sm:hidden bottom-16 z-40 bg-casama-blue mb-0.5 p-5 w-12 rounded-b-full" />
        {/* Big white center background */}
        <div className="fixed sm:hidden bottom-0  w-10/12 z-30 bg-white h-40 rounded-full" />
        {/* White left circled */}
        <div className="fixed sm:hidden bottom-16 w-14 ml-24 z-40 bg-white h-8 rounded-t-full " />
        {/* White right circled */}
        <div className="fixed sm:hidden bottom-16 w-14 mr-24 z-40 bg-white h-8 rounded-t-full " />
        {/* Casama inverted cirlces */}
        <div className="fixed sm:hidden bottom-20 w-24 z-30 bg-casama-blue h-6  " />
        {/* Put stuff in this div below */}
        <div className="fixed sm:hidden bottom-24 z-30 bg-casama-blue h-16 p-4 w-10/12 rounded-full ">
          <div className="flex flex-row justify-between items-center w-full  text-white -mt-2">
            <button onClick={() => toggleMenuButton()}>
              <Link className="" href="/betting/pools">
                <div className="flex flex-col items-center justify-center ml-8 cursor-pointer">
                  <ImUngroup className="text-2xl" />
                  <div>Betting</div>
                </div>
              </Link>
            </button>

            <button onClick={() => toggleMenuButton()}>
              <Link href="/balance">
                <div className="flex flex-col items-center justify-center mr-2 cursor-pointer">
                  <FaWallet className="text-2xl mt-0.5" />
                  <div>Wallet</div>
                </div>
              </Link>
            </button>

            <button onClick={() => toggleMenuButton()}>
              <Link href="/investing/pools">
                <div className="flex flex-col items-center justify-center mr-9 cursor-pointer">
                  <RiGroup2Fill className="text-2xl" />
                  <div>Pools</div>
                </div>
              </Link>
            </button>
          </div>
        </div>
      </div>

      <div
        className="fixed sm:hidden bottom-0 left-0 right-0 z-30 bg-casama-blue h-16 rounded-t-full border-t"
        sx={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex flex-row h-full w-full  justify-between items-center text-white">
          <Link href="/betting/bets">
            <div className="flex flex-col items-center justify-center w-1/3 mt-1 ml-8 cursor-pointer">
              <AiOutlineInsertRowBelow className="text-3xl" />
              <div className="text-base">My Bets</div>
            </div>
          </Link>
          <div className="flex items-center justify-center w-1/3">
            <button className="h-12 w-12" onClick={() => toggleMenuButton()}>
              <Image
                className="w-4"
                src={CasamaLogo}
                alt="CasamaIcon"
                layout="intrinsic"
              />
            </button>
          </div>
          <Link href="/profile">
            <div className="flex items-center justify-center w-1/3 mr-8">
              <Avatar
                loginMethod={user.loginMethod}
                walletConnectUrl={
                  user.walletConnectMeta?.icons
                    ? user.walletConnectMeta?.icons[0]
                    : null
                }
                wunderId={user.wunderId}
                text={user.wunderId || '0-X'}
                i={1}
              />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
