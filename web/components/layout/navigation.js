import { currency } from '/services/formatter';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import PoolInvites from './navComponents/poolInvites';
import MyPools from './navComponents/myPools';
import News from './navComponents/news';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Avatar from '/components/members/avatar';

const navigation = (props) => {
  const { user, open, setOpen } = props;
  const animateFrom = { opacity: 0, y: -40 };
  const animateTo = { opacity: 1, y: 0 };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.address != null) {
      setLoading(false);
    }
  }, [user.address]);

  return (
    <div className="hidden sm:block w-full">
      <ul className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-row justify-start">
          <li className="px-2 hidden sm:block">
            <MyPools {...props} />
          </li>
        </div>
        <div className="flex flex-row items-center justify-end ">
          <div className="flex px-3 ">
            <News {...props} />
          </div>
          <div className="flex px-3 pr-4 pb-0.5">
            <PoolInvites {...props} />
          </div>
          <div
            onClick={() => user.setTopUpRequired(true)}
            className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit mx-2 p-0.5 my-2 py-1.5 cursor-pointer"
          >
            <div className="flex flex-row pr-1 text-center items-center text-sm ">
              <p className="mx-2">{currency(user?.usdBalance)}</p>
              <BsFillPlusCircleFill className="text-xl mr-1" />
            </div>
          </div>

          <button
            className="hidden sm:block text-2xl pl-4  hover:text-red-500"
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
          <ul className="flex flex-col justify-between absolute top-16 w-1/8 bg-kaico-blue right-0 border-t-2 border-t-white pl-8 pr-3 shadow-xl text-right">
            <motion.li
              className="px-2 py-1 pt-2"
              initial={animateFrom}
              animate={animateTo}
              transition={{ delay: 0.05 }}
            >
              <MyPools {...props} />
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
  );
};

export default navigation;
