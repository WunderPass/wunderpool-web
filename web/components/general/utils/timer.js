import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const Timer = (props) => {
  const {
    start,
    end,
    size,
    text = 'Days',
    bar,
    setTimerLoading = () => {},
  } = props;
  const [timer, setTimer] = useState(0);

  const formatDecimals = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  const formattedDate = (millis) => {
    const seconds = Math.floor(millis % 60);
    const minutes = Math.floor((millis / 60) % 60);
    const hours = Math.floor((millis / 60 / 60) % 24);
    const days = Math.floor(millis / 60 / 60 / 24);

    if (days >= 1) {
      setTimerLoading(false);
      return `${Math.round(millis / 60 / 60 / 24)}`;
    } else if (millis >= 1) {
      setTimerLoading(false);
      if (hours >= 1) {
        return `${hours}:${formatDecimals(minutes)}`;
      } else {
        return `${formatDecimals(minutes)}:${formatDecimals(seconds)}`;
      }
    } else {
      return '00:00';
    }
  };

  useEffect(() => {
    const newTimer = Math.floor((new Date(end) - new Date()) / 1000);
    let timeout = null;
    if (newTimer > 172800) {
      setTimer(newTimer);
      timeout = setTimeout(() => {
        setTimer(newTimer);
      }, 86400);
    } else {
      timeout = setTimeout(() => {
        setTimer(newTimer);
      }, 1000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [timer, start, end]);

  return (
    <div className="flex-col justify-end items-center w-full ">
      <div className="flex flex-col w-full justify-center items-center">
        <div className="flex sm:text-3xl text-xl justify-center items-center w-16 ">
          {formattedDate(timer)}
        </div>

        <div className="flex flex-row opacity-50 w-full">
          {timer >= 86400 ? (
            <div className="sm:text-sm flex flex-row text-xs justify-center items-center w-full">
              <Typography className="text-xs ">{text}</Typography>
            </div>
          ) : timer >= 3600 ? (
            <div className="sm:text-sm flex flex-row text-xs justify-center items-center w-full">
              <div>Hours</div>
            </div>
          ) : (
            <div className="sm:text-sm flex flex-row text-xs justify-center items-center w-full">
              <div>Minutes</div>
            </div>
          )}
        </div>
      </div>
      {bar && (
        <div className="mt-5">
          <TimerBar
            passed={Math.round(Number(new Date())) - start}
            total={end - start}
          />
        </div>
      )}
    </div>
  );
};

export default Timer;

export function TimerBar(props) {
  const { passed, total } = props;

  function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
  }

  return (
    <>
      <div className="h-2.5 overflow-hidden text-xs flex rounded-full bg-white transition-all">
        <div
          style={{
            width: percentage(passed, total) + '%',
            transition: 'width 1s linear',
          }}
          className="rounded-full shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-casama-blue"
        ></div>
      </div>
    </>
  );
}
