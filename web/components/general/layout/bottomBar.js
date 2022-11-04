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
import { AiFillDatabase } from 'react-icons/ai';
import Link from 'next/link';

export default function BottomBar(props) {
  const { user } = props;
  const [value, setValue] = useState();
  const [showPoolList, setShowPoolList] = useState(false);
  const router = useRouter();

  const determineAction = (action) => {
    switch (action) {
      case 'myBets':
        setShowPoolList(false);
        router.push('/betting/pools');
        break;
      case 'menu':
        setShowPoolList((show) => !show);
        break;
      case 'profile':
        setShowPoolList(false);
        router.push('/profile');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (showPoolList) return;
    if (router.pathname == '/profile') {
      setValue('profile');
    } else if (
      ['/betting/pools/[address]', '/investing/pools/[address]'].includes(
        router.pathname
      )
    ) {
      setValue('menu');
    } else if (
      ['/betting/pools', '/investing/pools'].includes(router.pathname)
    ) {
      setValue('myBets');
    } else {
      setValue(null);
    }
  }, [router, showPoolList]);

  return (
    <ClickAwayListener onClickAway={() => setShowPoolList(false)}>
      <Paper
        sx={{
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        elevation={3}
        className="fixed sm:hidden"
      >
        <Collapse
          in={showPoolList}
          sx={{ maxHeight: '70vh', overflowY: 'scroll' }}
        >
          {user.pools.length > 0 ? (
            user.pools.map((pool, i) => {
              return (
                <Link
                  key={`user-pool-${pool.address}`}
                  href={`/betting/pools/${pool.address}`}
                  passHref
                >
                  <div
                    onClick={() => setShowPoolList(false)}
                    className="pt-3 w-full cursor-pointer"
                  >
                    <p className="pl-3">{pool.name}</p>
                    <Divider className="pt-3 opacity-80 font-black" />
                  </div>
                </Link>
              );
            })
          ) : (
            <div>No Pools</div>
          )}
        </Collapse>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            determineAction(newValue);
            setValue(newValue);
          }}
        >
          <BottomNavigationAction
            value="myBets"
            label="My Bets"
            icon={<AiFillDatabase className="text-xl mb-0.5" />}
          />
          <BottomNavigationAction
            value="menu"
            label="Menu"
            icon={<AppsIcon />}
          />

          <BottomNavigationAction
            label="Profile"
            value="profile"
            showLabel={false}
            icon={
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
            }
          />
        </BottomNavigation>
      </Paper>
    </ClickAwayListener>
  );
}
