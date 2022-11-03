import { Stack, Typography, IconButton, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '/services/shareLink';
import { getEnsNameFromAddress } from '/services/memberHelpers';
import usePool from '/hooks/usePool';

export default function EventCard(props) {
  const { event, handleSuccess, user } = props;
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const router = useRouter();

  const parseStartDateTime = (dateTime) => {
    const date = new Date(dateTime);
    setStartDate(
      date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      })
    );
    setStartTime(
      date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    );
  };

  const parseEndDateTime = (dateTime) => {
    const date = new Date(dateTime);
    setEndDate(
      date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      })
    );
    setEndTime(
      date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    );
  };

  useEffect(() => {
    parseStartDateTime(event.startTime);
    parseEndDateTime(event.endTime);
  }, [event.endTime && event.startTime]);

  return (
    <div className="container-white pb-16 ">
      <div className="flex flex-col items-center justify-center text-center mt-2 mb-5">
        <div className="opacity-50 text-base">{event.name}</div>
        <div className="flex flex-row items-center mt-5 justify-between w-full sm:text-2xl text-lg ">
          <div className="flex flex-row w-5/12 lg:flex-col items-center justify-start sm:justify-center  text-left sm:text-center ">
            <div>{event.teamHome}</div>
            <div></div>
          </div>
          <div className="flex flex-col w-2/12 opacity-70 items-center justify-center ">
            <div className="text-sm sm:text-lg">{startDate}</div>
            <div className="text-sm sm:text-base">{startTime}</div>
          </div>
          <div className="flex flex-row w-5/12 lg:flex-col items-center justify-end sm:justify-center text-right sm:text-center ">
            <div>{event.teamAway}</div>
            <div></div>
          </div>
        </div>
      </div>
      <Divider />
      <div className="my-5">
        <div className="flex justify-center items-center text-semibold sm:text-lg">
          Public Betting Games
        </div>
        <div>
          <div className="opacity-70 mb-2 mt-4 sm:mt-0 text-sm sm:text-base">
            Enter a bet:
          </div>
          <div className="flex flex-row w-full gap-3">
            <div className="flex flex-col container-casama-light-p-0 items-between p-3 w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:p-2 p-0">
                <div className="text-casama-blue font-semibold">5€</div>
                <div className="opacity-50 mt-1 sm:mt-0 text-sm">47/50</div>
              </div>
              <button className="btn-casama mt-2 sm:mt-0 px-4 sm:px-6 p-1">
                Join
              </button>
            </div>
            <div className="flex flex-col container-casama-light-p-0 items-between p-3 w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:p-2 p-0">
                <div className="text-casama-blue font-semibold">15€</div>
                <div className="opacity-50 mt-1 sm:mt-0 text-sm">47/50</div>
              </div>
              <button className="btn-casama mt-2 sm:mt-0  px-4 sm:px-6 p-1">
                Join
              </button>
            </div>
            <div className="flex flex-col container-casama-light-p-0 items-between p-3 w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:p-2 p-0">
                <div className="text-casama-blue font-semibold">50€</div>
                <div className="opacity-50 mt-1 sm:mt-0 text-sm">47/50</div>
              </div>
              <button className="btn-casama mt-2 sm:mt-0  px-4 sm:px-6 p-1">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
      <Divider />
      <div className="flex flex-col justify-center items-center my-5">
        <div className="text-semibold sm:text-lg mb-4">
          Create a private Betting Game
        </div>

        <div className="flex flex-row w-full gap-3">
          <button className="btn-casama w-full p-2"> 5€ </button>
          <button className="btn-casama w-full p-2"> 10€</button>
          <button className="btn-casama w-full p-2"> Custom €</button>
        </div>
      </div>
    </div>
  );
}
