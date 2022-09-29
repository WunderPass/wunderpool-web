import { AppBar, ClickAwayListener, Stack, Toolbar, Chip } from '@mui/material';
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user.address != null) setLoading(false);
  }, [user.address]);

  if (pathname === '/') return null;

  return (
    <>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <AppBar className="bg-casama-blue" position="fixed" sx={{ top: 0 }}>
          <Toolbar>
            <Stack className="flex flex-row w-full justify-between items-center mt-1">
              <Link href="/pools">
                <div className="flex flex-row cursor-pointer items-center">
                  <div className="hidden pl-1.5 items-center justify-center mr-2 sm:block">
                    <div className="hidden pb-1.5 w-40 sm:block">
                      <Image
                        src={CasamaIcon}
                        alt="CasamaIcon"
                        layout="responsive"
                        className="ml-1"
                      />
                    </div>
                  </div>
                  <Chip
                    className="hidden sm:block bg-casama-extra-light-blue text-casama-blue mb-1 mr-10"
                    size="small"
                    label="Beta"
                  />

                  <div className="sm:hidden">
                    {!loading && (
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
                    )}
                  </div>
                </div>
              </Link>
              {user.loggedIn && (
                <>
                  <Navigation open={open} setOpen={setOpen} {...props} />
                  <MobileNavigation open={open} setOpen={setOpen} {...props} />
                </>
              )}
            </Stack>
          </Toolbar>
        </AppBar>
      </ClickAwayListener>
      <Toolbar />
    </>
  );
}
