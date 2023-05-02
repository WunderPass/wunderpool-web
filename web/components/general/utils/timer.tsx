import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Typography } from '@mui/material';

type TimerProps = {
  start: number | Date;
  end: number | Date;
  text?: string;
  bar?: boolean;
};

export default function Timer(props: TimerProps) {
  const { start, end, text = 'Days', bar } = props;
  const [timer, setTimer] = useState(0);

  const formatDecimals = (num: number) => {
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
    setTimer(Math.floor((Number(new Date(end)) - Number(new Date())) / 1000));
    let interval = null;
    interval = setInterval(() => {
      setTimer(Math.floor((Number(new Date(end)) - Number(new Date())) / 1000));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [start, end]);

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
            passed={Math.round(Number(new Date())) - Number(start)}
            total={Number(end) - Number(start)}
          />
        </div>
      )}
    </div>
  );
}

type TimeBarProps = {
  passed: number;
  total: number;
};

export function TimerBar(props: TimeBarProps) {
  const { passed, total } = props;

  function percentage(partialValue: number, totalValue: number) {
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
