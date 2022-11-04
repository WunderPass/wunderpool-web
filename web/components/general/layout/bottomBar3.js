import {
  BottomNavigation,
  BottomNavigationAction,
  ClickAwayListener,
  Collapse,
  Divider,
  Paper,
  Zoom,
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
import DropIcon from '/assets/icons/drop.svg';
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
    <ClickAwayListener onClickAway={() => setShowMenu(false)}>
      <div
        className="fixed sm:hidden bottom-0 left-0 z-50 w-full"
        style={{
          pointerEvents: showMenu ? 'all' : 'none',
        }}
      >
        <div
          in={showMenu}
          className={`transition-transform duration-200 ${
            showMenu
              ? 'translate-y-0 scale-100'
              : 'pointer-events-none translate-y-full scale-0'
          }`}
        >
          <div className={`w-full text-white py-5 px-3`}>
            <div className="flex flex-row justify-between items-center w-full bg-casama-blue p-3 rounded-2xl relative">
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-[500px]">
                <Image src={DropIcon} layout="responsive" />
              </div>
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
        <div className="flex flex-row h-full w-full justify-between items-center text-white bg-casama-blue rounded-t-3xl py-1 pointer-events-auto">
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
        <div
          className="bg-casama-blue w-full"
          style={{
            height: 'env(safe-area-inset-bottom)',
          }}
        />
      </div>
    </ClickAwayListener>
  );
}
