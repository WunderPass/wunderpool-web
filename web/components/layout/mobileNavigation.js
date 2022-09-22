import { currency } from '/services/formatter';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { AiOutlineClose } from 'react-icons/ai';
import { GiHamburgerMenu } from 'react-icons/gi';
import { motion } from 'framer-motion';
import PoolInvites from './navComponents/poolInvites';
import MyPools from './navComponents/myPools';
import News from './navComponents/news';

const mobileNavigation = (props) => {
  const { user, open, setOpen } = props;
  const animateFrom = { opacity: 0, y: -40 };
  const animateTo = { opacity: 1, y: 0 };

  const hamburgerIcon = (
    <GiHamburgerMenu className="text-3xl ml-2.5"> </GiHamburgerMenu>
  );
  const closeIcon = (
    <AiOutlineClose className="text-3xl ml-2.5"></AiOutlineClose>
  );

  return (
    <>
      <div className="block sm:hidden pb-1">
        <div className="flex flex-row items-center">
          <div className="flex px-2 ">
            <News {...props} />
          </div>
          <div className="flex px-2 pb-0.5">
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
            className="sm:block text-sm"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? closeIcon : hamburgerIcon}
          </button>
        </div>
        {open && (
          <div>
            <ul className="flex flex-col justify-between absolute top-13 left-0 bg-kaico-blue w-full border-t-2  border-t-white align-right pl-1 shadow-xl">
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
                  className="ml-2 pb-2 py-1 hover:text-[#ff0000]"
                  onClick={user?.logOut}
                >
                  Log out
                </button>
              </motion.li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default mobileNavigation;
