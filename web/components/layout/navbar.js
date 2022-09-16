import { AppBar, Stack, Toolbar } from '@mui/material';
import Image from 'next/image';
import CasamaIcon from '/public/casama-wht.svg';
import { useRouter } from 'next/router';
import MobileNavigation from './mobileNavigation';
import Navigation from './navigation';
import Link from 'next/link';
import Avatar from '/components/members/avatar';
import { useEffect, useState } from 'react';

export default function Navbar(props) {
  const { user } = props;
  const { pathname } = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.wunderId != null) setLoading(false);
  }, [user.wunderId]);

  if (pathname === '/') return null;

  return (
    <>
      <AppBar className="bg-kaico-blue" position="fixed" sx={{ top: 0 }}>
        <Toolbar>
          <Stack className="flex flex-row w-full justify-between items-center mt-1">
            <Link href="/pools">
              <div className="flex flex-row cursor-pointer">
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
                <div className="sm:hidden">
                  {!loading && (
                    <Avatar
                      wunderId={user.wunderId}
                      text={user.wunderId ? user.wunderId : '0-X'}
                      i={1}
                    />
                  )}
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
