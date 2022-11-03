import { AppBar, ClickAwayListener, Stack, Toolbar, Chip } from '@mui/material';
import Image from 'next/image';
import CasamaLogo from '/public/casama-wht.svg';
import CasamaIcon from '/public/casama_logo_white.png';
import { currency } from '/services/formatter';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import PoolInvites from './navComponents/poolInvites';
import News from './navComponents/news';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Avatar from '/components/general/members/avatar';
import Link from 'next/link';

export default function TopBar(props) {
  const { user } = props;
  const [open, setOpen] = useState(false);
  const animateFrom = { opacity: 0, y: -40 };
  const animateTo = { opacity: 1, y: 0 };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.address != null) {
      setLoading(false);
    }
  }, [user.address]);

  return (
    <>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <AppBar
          className="bg-casama-blue"
          position="fixed"
          sx={{
            paddingTop: 'env(safe-area-inset-top)',
            top: 0,
          }}
        >
          <Toolbar>
            <Stack className="hidden sm:flex flex-row w-full justify-between items-center mt-1">
              <Link href="/betting/pools">
                <div className="flex flex-row cursor-pointer items-center">
                  <div className="pl-1.5 items-center justify-center mr-2">
                    <div className="pb-1.5 hidden lg:block w-40">
                      <Image
                        src={CasamaLogo}
                        alt="CasamaLogo"
                        layout="responsive"
                        className="ml-1"
                      />
                    </div>
                    <div className="pb-1.5 block lg:hidden w-8">
                      <Image
                        src={CasamaIcon}
                        alt="CasamaIcon"
                        layout="responsive"
                        className="ml-1"
                      />
                    </div>
                  </div>
                  <div className="mb-1 hidden lg:block">
                    <Chip
                      className="items-center flex bg-casama-extra-light-blue text-casama-blue  mr-10"
                      size="small"
                      label="Beta"
                    />
                  </div>
                </div>
              </Link>
              {user.loggedIn ? (
                <div className="w-full">
                  <ul className="flex flex-row justify-between items-center w-full">
<<<<<<< HEAD
                    <div className="flex flex-row justify-start">
                      <Link href={`/betting/bets`}>
                        <li className="px-5 py-2 hidden sm:block hover:bg-casama-light-blue rounded-lg cursor-pointer">
=======
                    <div className="flex flex-row justify-start gap-8">
                      <Link href={`/betting/bets`}>
                        <li className="px-5 p-2 hidden sm:block hover:bg-casama-light-blue rounded-lg cursor-pointer">
>>>>>>> feature/bettingView
                          My Bets
                        </li>
                      </Link>
                      <Link href={`/betting/pools`}>
<<<<<<< HEAD
                        <li className="px-5 py-2 hidden sm:block hover:bg-casama-light-blue rounded-lg cursor-pointer">
=======
                        <li className="px-5 p-2 hidden sm:block hover:bg-casama-light-blue rounded-lg cursor-pointer">
>>>>>>> feature/bettingView
                          Betting
                        </li>
                      </Link>
                      <Link href={`/investing/pools`}>
<<<<<<< HEAD
                        <li className="px-5 py-2 hidden sm:block hover:bg-casama-light-blue rounded-lg cursor-pointer">
=======
                        <li className="px-5 p-2 hidden sm:block hover:bg-casama-light-blue rounded-lg cursor-pointer">
>>>>>>> feature/bettingView
                          Pools
                        </li>
                      </Link>
                    </div>
                    <div className="flex flex-row items-center justify-end ">
                      <div className="flex px-3 ">
                        <News {...props} />
                      </div>
                      <div className="flex px-3 pr-4 pb-0.5">
                        <PoolInvites {...props} />
                      </div>
                      <Link href="/balance">
                        <a className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit mx-2 p-0.5 my-2 py-1.5 cursor-pointer">
                          <div className="flex flex-row pr-1 text-center items-center text-sm ">
                            <p className="mx-2">{currency(user?.usdBalance)}</p>
                            <BsFillPlusCircleFill className="text-xl mr-1" />
                          </div>
                        </a>
                      </Link>

                      <button
                        className="text-2xl pl-4 hover:text-red-500"
                        onClick={() => setOpen((prev) => !prev)}
                      >
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
                      </button>
                    </div>
                  </ul>
                  {open && (
                    <div>
                      <ul className="flex flex-col justify-between absolute top-16 w-1/8 bg-casama-blue right-0 border-t-2 border-t-white pl-8 pr-3 shadow-xl text-right">
                        <motion.li
                          className="px-2 py-1 pt-2"
                          initial={animateFrom}
                          animate={animateTo}
                          transition={{ delay: 0.05 }}
                        >
                          <Link href={`/betting/bets`}>My Bets</Link>
                        </motion.li>
                        <motion.li
                          className="px-2 py-1 pt-2"
                          initial={animateFrom}
                          animate={animateTo}
                          transition={{ delay: 0.05 }}
                        >
                          <Link href={`/betting/pools`}>Betting</Link>
                        </motion.li>
                        <motion.li
                          className="px-2 py-1 pt-2"
                          initial={animateFrom}
                          animate={animateTo}
                          transition={{ delay: 0.05 }}
                        >
                          <Link href={`/investing/pools`}>Pools</Link>
                        </motion.li>

                        {user.loginMethod == 'WunderPass' && (
                          <motion.li
                            initial={animateFrom}
                            animate={animateTo}
                            transition={{ delay: 0.1 }}
                          >
                            <div className="px-2 py-1">
                              <a
                                target="_blank"
                                href={`${process.env.WUNDERPASS_URL}/profile`}
                              >
                                Profile
                              </a>
                            </div>
                          </motion.li>
                        )}

                        <motion.li
                          initial={animateFrom}
                          animate={animateTo}
                          transition={{ delay: 0.15 }}
                        >
                          <button
                            className="px-2 pb-2 py-1 hover:text-[#ff0000]"
                            onClick={user?.logOut}
                          >
                            Log out
                          </button>
                        </motion.li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/">
                  <a className="btn-casama-white px-5 py-2">Login</a>
                </Link>
              )}
            </Stack>
            <div className="flex sm:hidden w-full items-center justify-between">
              <p className="font-bold flex-grow">{user.wunderId}</p>
              <div className="flex px-3 ">
                <News {...props} />
              </div>
              <div className="flex px-3 pr-4 pb-0.5">
                <PoolInvites {...props} />
              </div>
              <Link href="/balance">
                <a className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit mx-2 p-0.5 my-2 py-1.5 cursor-pointer">
                  <div className="flex flex-row pr-1 text-center items-center text-sm ">
                    <p className="mx-2">{currency(user?.usdBalance)}</p>
                    <BsFillPlusCircleFill className="text-xl mr-1" />
                  </div>
                </a>
              </Link>
            </div>
          </Toolbar>
        </AppBar>
      </ClickAwayListener>
      <Toolbar />
      <div
        style={{
          height: 'env(safe-area-inset-top)',
        }}
      ></div>
    </>
  );
}
