import { Popover, Divider } from '@mui/material';
import { useState, MouseEvent } from 'react';

export default function PayoutRuleInfoButton() {
  const [showInfo, setShowInfo] = useState(false);
  const [infoBoxAnchorEl, setInfoBoxAnchorEl] = useState<Element>();

  const showPayoutRuleInfo = (e: MouseEvent<HTMLDivElement>) => {
    setInfoBoxAnchorEl(e.currentTarget);
    setShowInfo(!showInfo);
  };

  const handleClose = () => {
    setShowInfo(false);
  };

  return (
    <div>
      <div className="cursor-pointer" onClick={showPayoutRuleInfo}>
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 512 512"
          className="ml-2 text-xl mb-1 text-casama-blue"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579 0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666 2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112 261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z"></path>
        </svg>
      </div>
      <Popover
        open={showInfo}
        onClose={handleClose}
        anchorEl={infoBoxAnchorEl}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div>
          <div
            onClick={() => setShowInfo(false)}
            className="flex flex-col text-gray-500 text-sm my-2 sm:my-0"
          >
            <div className="flex flex-col m-2 mx-3 ">
              <span className="flex flex-row justify-between w-full text-base font-bold underline sm:text-center mb-1">
                Scoring system:
                <span className="flex flex-row justify-end cursor-pointer">
                  X
                </span>
              </span>

              <div className="flex flex-col mx-0 sm:mx-2">
                <span>
                  <b>3 Points:</b> Hit the exact result of the game.
                </span>
                <span>
                  <b>2 Points: </b> Hit the winning team and the right goal
                  difference between the teams.
                </span>
                <span>
                  <b>1 Point: </b> Hit the winning team.
                </span>
                <span>
                  <b>0 Points: </b> Bet on the wrong team.
                </span>
              </div>
            </div>
            <Divider flexItem />
            <div className="flex sm:flex-row flex-col">
              <div className="m-2 mx-3">
                <div className="flex flex-col w-64">
                  <span className="text-base font-bold underline sm:text-center mb-1">
                    Winner Takes It All:
                  </span>
                  <span>
                    The player with the most points wins the pot. If 2 or more
                    players have the same amount of points they split the pot.
                  </span>
                </div>
              </div>
              <Divider
                orientation="vertical"
                flexItem
                className="hidden sm:flex"
              />
              <Divider className="sm:hidden flex" flexItem />
              <div className="m-2 mx-3">
                <div className="flex flex-col w-64">
                  <span className="text-base font-bold underline sm:text-center mb-1">
                    Proportional:
                  </span>
                  <span>
                    Win a proportion of the pot in the size of the points you
                    scored, relative to the total amount of scored points.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Popover>
    </div>
  );
}
