import { useEffect, useState } from 'react';
import MenuUnstyled from '@mui/base/MenuUnstyled';
import MenuItemUnstyled from '@mui/base/MenuItemUnstyled';
import { MdKeyboardArrowDown } from 'react-icons/md';

export default function DropDown(props) {
  const { list, value, setValue } = props;
  const [eventListOpen, setEventListOpen] = useState(null);

  const handleMenuClose = () => {
    setEventListOpen(null);
  };
  return (
    <>
      <button
        className={
          eventListOpen
            ? 'container-white-p-0 p-3 border-gray-800 border w-56'
            : 'container-white-p-0 p-3 border-gray-300 border w-56'
        }
        onClick={(e) => setEventListOpen(e.currentTarget)}
      >
        <div className="flex flex-row justify-between items-center">
          <p className="text-gray-800 text-lg font-medium ml-2">{value}</p>
          <MdKeyboardArrowDown className="text-2xl text-gray-800" />
        </div>
      </button>

      <MenuUnstyled
        className="container-white-p-0 rounded-full m-2 drop-shadow-around"
        open={Boolean(eventListOpen)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        anchorEl={eventListOpen}
      >
        {list &&
          list.map((item, i) => {
            return (
              <MenuItemUnstyled
                key={`menu-item-${item}`}
                className={
                  i == 0
                    ? 'shadow-dropdown-b border-b border-gray-200 hover:border-gray-400 hover:drop-shadow-md mt-1 w-56'
                    : i == list.length - 1
                    ? 'shadow-dropdown-t border-t border-gray-200 hover:border-gray-400 hover:drop-shadow-md mb-1 w-56'
                    : 'shadow-dropdown-y border-y border-gray-200 hover:border-gray-400 hover:drop-shadow-md w-56'
                }
              >
                <div className="flex flex-row items-center justify-between w-full">
                  <button
                    onClick={() => setValue(item)}
                    className="text-gray-800 text-base text-left font-medium w-full p-3 ml-1 mt-1 cursor-pointer"
                  >
                    {item}
                  </button>
                </div>
              </MenuItemUnstyled>
            );
          })}
      </MenuUnstyled>
    </>
  );
}
