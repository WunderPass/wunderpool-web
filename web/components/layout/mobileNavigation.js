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

const mobileNavigation = (props) => {
  const { user } = props;
  const [usdcBalance, setUsdcBalance] = useState(true);

  useEffect(() => {
    if (!user.usdBalance) return;
    setUsdcBalance(user?.usdBalance);
  }, [user.usdBalance]);

  return (
    <>
      <div className="block sm:hidden pt-1">
        <button className="sm:block text-sm" onClick={user?.logOut}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </>
  );
};

export default mobileNavigation;
