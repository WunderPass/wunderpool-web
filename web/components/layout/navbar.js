import { useEffect, useState } from 'react';
import { AppBar, Link, Stack, Toolbar } from '@mui/material';
import Image from 'next/image';
import WunderPoolIcon from '/public/wunderpool_logo_white.svg';
import CasamaIcon from '/public/casama-wht.svg';
import UserIcon from '/public/user.png';
import { useRouter } from 'next/router';
import MobileNavigation from './mobileNavigation';
import Navigation from './navigation';

export default function Navbar(props) {
  const { user } = props;
  const { asPath } = useRouter();

  if (asPath === '/') return null;

  return (
    <>
      <AppBar className="bg-kaico-blue" position="fixed" sx={{ top: 0 }}>
        <Toolbar>
          <Stack className="flex flex-row w-full justify-between items-center mt-1">
            <Link href="/pools">
              <div className="flex flex-row">
                <div className="hidden pl-1.5 items-center justify-center mr-4 sm:block">
                  <div className="hidden pb-1.5 w-40 sm:block">
                    <Image
                      src={CasamaIcon}
                      alt="CasamaIcon"
                      layout="responsive"
                      className="ml-1"
                    />
                  </div>
                </div>

                <div className="flex-col justify-between border-solid w-9 h-9 ml-1 border-white rounded-full bg-kaico-extra-light-blue shadow-xl block sm:hidden">
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
