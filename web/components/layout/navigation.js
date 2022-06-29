import { currency } from '/services/formatter';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { HiOutlineLogout } from 'react-icons/hi';
import PoolInvites from './navComponents/poolInvites';
import MyPools from './navComponents/myPools';
import News from './navComponents/news';

const navigation = (props) => {
  const { user } = props;

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
          <div className="flex px-3 pr-4 ">
            <PoolInvites {...props} />
          </div>
          <div
            onClick={() => user.setTopUpRequired(true)}
            className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit mx-2 p-0.5 my-2 py-1.5 cursor-pointer"
          >
            <div className="flex flex-row pr-1 text-center items-center text-sm ">
              <p className="mx-2">{currency(user?.usdBalance, {})}</p>
              <BsFillPlusCircleFill className="text-xl mr-1" />
            </div>
          </div>

          <button
            className="hidden sm:block text-2xl pl-2  hover:text-red-500"
            onClick={user?.logOut}
          >
            <HiOutlineLogout />
          </button>
        </div>
      </ul>
    </div>
  );
};

export default navigation;
