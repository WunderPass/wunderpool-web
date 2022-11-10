import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const Timer = (props) => {
  const { start, end, text = 'Days Left', bar } = props;
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
      return `${Math.round(millis / 60 / 60 / 24)}`;
    } else if (millis >= 1) {
      return `${formatDecimals(hours)}:${formatDecimals(
        minutes
      )}:${formatDecimals(seconds)}`;
    } else {
      return '00:00:00';
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
  }, [timer]);

  return (
    <div className="flex-col justify-end items-center">
      <div>
        <div className="text-3xl ml-1">{formattedDate(timer)}</div>
        <div className="flex flex-row opacity-50">
          {timer >= 86400 ? (
            <>
              <Typography className="text-xs mr-1">{text}</Typography>
            </>
          ) : (
            <>
              <Typography className="text-xs mr-1">Hours</Typography>
              <Typography className="text-xs mx-1">Minutes</Typography>
              <Typography className="text-xs ml-1">Seconds</Typography>
            </>
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
