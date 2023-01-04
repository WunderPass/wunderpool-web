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
import { useRouter } from 'next/router';
import AdminMenu from './navComponents/adminMenu';
import ReactourTarget from '../utils/reactourTarget';
import { FiLogOut } from 'react-icons/fi';
import { MdPersonOutline } from 'react-icons/md';
import { FaWallet } from 'react-icons/fa';

export default function TopBar(props) {
  const { user } = props;
  const [open, setOpen] = useState(false);
  const animateFrom = { opacity: 0, y: -40 };
  const animateTo = { opacity: 1, y: 0 };
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
            <Stack className="hidden sm:flex flex-row w-full justify-between items-center">
              <Link href="/betting">
                <div className="flex flex-row cursor-pointer items-center">
                  <div className="pl-1.5 items-center justify-center mr-3">
                    <div className="hidden lg:block w-40">
                      <Image
                        src={CasamaLogo}
                        alt="CasamaLogo"
                        layout="responsive"
                      />
                    </div>
                    <div className="block lg:hidden w-8">
                      <Image
                        src={CasamaIcon}
                        alt="CasamaIcon"
                        layout="responsive"
                      />
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <Chip
                      className="items-center flex bg-casama-extra-light-blue text-casama-blue mr-3"
                      size="small"
                      label="Beta"
                    />
                  </div>
                </div>
              </Link>
              {user.loggedIn ? (
                <div className="w-full">
                  <ul className="flex flex-row justify-between items-center w-full">
                    <div className="hidden sm:flex flex-row justify-start gap-1">
                      <ReactourTarget name="all-games" from="sm">
                        <div>
                          <Link href={`/betting`}>
                            <li
                              className={`px-4 p-2 rounded-lg cursor-pointer hover:bg-casama-light-blue ${
                                ['/betting', '/onboarding'].includes(
                                  router.pathname
                                )
                                  ? 'bg-casama-light-blue'
                                  : ''
                              }`}
                            >
                              All Games
                            </li>
                          </Link>
                        </div>
                      </ReactourTarget>
                      <ReactourTarget name="multi-games" from="sm">
                        <div>
                          <Link href={`/betting/multi`}>
                            <li
                              className={`px-4 p-2 rounded-lg cursor-pointer hover:bg-casama-light-blue ${
                                ['/betting/multi', '/onboarding'].includes(
                                  router.pathname
                                )
                                  ? 'bg-casama-light-blue'
                                  : ''
                              }`}
                            >
                              Multi Games
                            </li>
                          </Link>
                        </div>
                      </ReactourTarget>
                      <ReactourTarget name="my-bets" from="sm">
                        <div>
                          <Link href={`/betting/bets`}>
                            <li
                              className={`px-4 py-2 rounded-lg cursor-pointer hover:bg-casama-light-blue ${
                                router.pathname == '/betting/bets'
                                  ? 'bg-casama-light-blue'
                                  : ''
                              }`}
                            >
                              My Bets
                            </li>
                          </Link>
                        </div>
                      </ReactourTarget>
                      <Link href="/profile/rewards">
                        <li
                          className={`px-4 p-2 rounded-lg cursor-pointer hover:bg-casama-light-blue ${
                            router.pathname == '/profile/rewards'
                              ? 'bg-casama-light-blue'
                              : ''
                          }`}
                        >
                          Rewards
                        </li>
                      </Link>
                      {user.isAdmin && <AdminMenu />}
                    </div>
                    <div className="flex flex-row items-center justify-end ">
                      <div className="flex px-3 ">
                        <News {...props} />
                      </div>
                      <Link href="/balance">
                        <a className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit mx-2 p-0.5 my-2 py-1.5 cursor-pointer">
                          <ReactourTarget name="user-balance" from="sm">
                            <div className="flex flex-row pr-1 text-center items-center text-sm ">
                              <p className="mx-2">
                                {currency(user?.usdBalance)}
                              </p>
                              <BsFillPlusCircleFill className="text-xl mr-1" />
                            </div>
                          </ReactourTarget>
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
                            text={user.userName || user.firstName || '0X'}
                            i={1}
                          />
                        )}
                      </button>
                    </div>
                  </ul>
                  {open && (
                    <div>
                      <ul className="flex flex-col absolute top-16 mt-1 w-36 bg-casama-blue right-0 mr-2  shadow-xl text-right rounded-xl">
                        <div
                          onClick={() => setOpen(false)}
                          className="hover:bg-casama-light rounded-t-xl"
                        >
                          <motion.li
                            initial={animateFrom}
                            animate={animateTo}
                            transition={{ delay: 0.05 }}
                          >
                            <div className="cursor-pointer mx-4 mt-3 mb-2">
                              <Link
                                href={
                                  user.loginMethod == 'WunderPass'
                                    ? 'https://app.wunderpass.org/balance'
                                    : '/balance'
                                }
                              >
                                <div className="flex flex-row items-center justify-between ">
                                  <FaWallet className="text-xl mb-1 ml-0.5" />
                                  Wallet
                                </div>
                              </Link>
                            </div>
                          </motion.li>
                        </div>
                        <div
                          onClick={() => setOpen(false)}
                          className="hover:bg-casama-light "
                        >
                          <motion.li
                            initial={animateFrom}
                            animate={animateTo}
                            transition={{ delay: 0.1 }}
                          >
                            <div className="cursor-pointer mx-4 mb-2 mt-2">
                              <Link
                                href={
                                  user.loginMethod == 'WunderPass'
                                    ? 'https://app.wunderpass.org/profile'
                                    : '/profile'
                                }
                              >
                                <div className="flex flex-row items-center justify-between ">
                                  <MdPersonOutline className="text-2xl mb-1" />
                                  Profile
                                </div>
                              </Link>
                            </div>
                          </motion.li>
                        </div>{' '}
                        <div className="hover:bg-casama-light rounded-b-xl">
                          <motion.li
                            initial={animateFrom}
                            animate={animateTo}
                            transition={{ delay: 0.15 }}
                          >
                            <div className="cursor-pointer mx-4 mb-2 mt-2">
                              <button
                                className=" hover:text-red-500 w-full "
                                onClick={user?.logOut}
                              >
                                <div className="flex flex-row justify-between items-center w-full ">
                                  <FiLogOut className="text-xl ml-0.5" />
                                  <p>Log out</p>
                                </div>
                              </button>
                            </div>
                          </motion.li>
                        </div>
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
              <div className="font-bold flex-grow">
                <Link href="/profile">
                  <div className="flex items-start justify-start ml-2 mr-4 cursor-pointer">
                    <Avatar
                      loginMethod={user.loginMethod}
                      walletConnectUrl={
                        user.walletConnectMeta?.icons
                          ? user.walletConnectMeta?.icons[0]
                          : null
                      }
                      wunderId={user.wunderId}
                      text={user.userName || user.firstName || '0X'}
                      i={1}
                    />
                  </div>
                </Link>
              </div>

              <div className="flex px-3 ">
                <News {...props} />
              </div>
              <div className="flex px-3 pr-4 pb-0.5">
                <PoolInvites {...props} />
              </div>
              <Link href="/balance">
                <a className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit mx-2 p-0.5 my-2 py-1.5 cursor-pointer">
                  <ReactourTarget name="user-balance" to="sm">
                    <div className="flex flex-row pr-1 text-center items-center text-sm ">
                      <p className="mx-2">{currency(user?.usdBalance)}</p>
                      <BsFillPlusCircleFill className="text-xl mr-1" />
                    </div>
                  </ReactourTarget>
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
