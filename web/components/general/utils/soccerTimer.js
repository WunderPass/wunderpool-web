import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const Timer = (props) => {
  const { start, end, size } = props;
  const [timer, setTimer] = useState(0);

  const formatDecimals = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  const formattedDate = (millis) => {
    const seconds = Math.floor(millis % 60);
    const minutes = Math.floor((millis / 90) % 90); //TODO chekc if this works

    if (millis >= 1) {
      return `${formatDecimals(minutes)}:${formatDecimals(seconds)}`;
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
  }, [timer]);

  return (
    <div className="flex-col justify-end items-center">
      <div>
        <div
          className={
            size == 'large'
              ? 'text-3xl ml-1'
              : size == 'medium'
              ? 'text-xl ml-1'
              : 'text-base ml-1'
          }
        >
          {formattedDate(timer)}
        </div>
      </div>
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
