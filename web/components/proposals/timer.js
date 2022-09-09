import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import TimerBar from '/components/proposals/timerBar';

const Timer = (props) => {
  const { proposal } = props;
  const finalTime = new Date(proposal.deadline).getTime();
  const start = new Date(proposal.createdAt).getTime();
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
    const newTimer = Math.floor((new Date(finalTime) - new Date()) / 1000);
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
              <Typography className="text-xs mr-1">
                Days Left to Vote
              </Typography>
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
      <div className="mt-5">
        <TimerBar
          passed={Math.round(Number(new Date()) / 1000) - start}
          total={finalTime - start}
        />
      </div>
    </div>
  );
};

export default Timer;
