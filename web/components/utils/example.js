import { Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { BsFillPlusCircleFill } from 'react-icons/bs';

export default function Example(props) {
  const { user, setOpen, menuButton } = props;
  const [poolListOpen, setPoolListOpen] = useState(null);

  const handleMenuClose = () => {
    setOpen(false);
    setPoolListOpen(null);
  };

  return (
    <div className="text-right">
      <Menu
        as="div"
        open={Boolean(poolListOpen)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        className="relative inline-block text-left"
      >
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            {menuButton}
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-casama-extra-light-blue shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1 ">
              {user.pools.length > 0 &&
                user.pools.map((pool, i) => {
                  <Link
                    key={`user-pool-${i}`}
                    href={`/pools/${pool.address}?name=${pool.name.replaceAll(
                      '&',
                      '%26'
                    )}`}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                    passHref
                  >
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active
                              ? 'bg-casama-blue text-white'
                              : 'text-gray-900'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          <div>{pool.name}</div>
                          <div className="ml-2">
                            <Chip
                              className="items-center hidden sm:flex bg-casama-extra-light-blue text-casama-blue  "
                              size="small"
                              label={(pool.version?.name).toLowerCase()}
                            />
                          </div>
                          <Divider className="my-2 opacity-80 font-black" />
                        </button>
                      )}
                    </Menu.Item>
                  </Link>;
                })}
              {user.pools.length == 0 && <Menu.Item> - no pools - </Menu.Item>}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
