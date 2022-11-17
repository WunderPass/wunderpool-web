import { Typography, Popover, Divider } from '@mui/material';
import { useState } from 'react';
import { FaRegQuestionCircle } from 'react-icons/fa';

export default function PayoutRuleInfoButton(props) {
  const [showInfo, setShowInfo] = useState(false);
  const [infoBoxAnchorEl, setInfoBoxAnchorEl] = useState(false);

  const showPayoutRuleInfo = (e, bool) => {
    setInfoBoxAnchorEl(e.currentTarget - 100);
    setShowInfo(!showInfo);
  };

  const handleClose = () => {
    setShowInfo(false);
  };

  return (
    <>
      <div
        className="cursor-pointer "
        onMouseOver={(e) => showPayoutRuleInfo(e)}
      >
        <FaRegQuestionCircle className="ml-2 text-xl mb-1 text-casama-blue" />
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
            onMouseLeave={() => setShowInfo(false)}
            className="flex flex-col text-gray-500 text-sm my-2 sm:my-0"
          >
            <div className="flex flex-col m-2 mx-3 ">
              <span className="text-base font-bold underline sm:text-center mb-1">
                Scoring system:
              </span>
              <div className="flex flex-col mx-0 sm:mx-2">
                <span>
                  <span className="font-bold">3 Points:</span> Hit the exact
                  result of the game.
                </span>
                <span>
                  <span className="font-bold">2 Points: </span> Hit the winning
                  team and the right goal difference between the teams.
                </span>
                <span>
                  <span className="font-bold">1 Point: </span> Hit the winning
                  team.{' '}
                </span>
                <span>
                  <span className="font-bold">0 Points: </span> Bet on the wrong
                  team.
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
    </>
  );
}
