import React, { useState, useRef, useEffect } from 'react';
import { Typography } from '@mui/material';
import TimerBar from '/components/proposals/timerBar';

const Timer = (props) => {
  const { proposal, wunderPool, user } = props;
  // We need ref in this, because we are dealing
  // with JS setInterval to keep track of it and
  // stop it when needed
  const Ref = useRef(null);

  // The state for our timer
  const [timer, setTimer] = useState('00:00:00');
  const [remainingTimeInSec, setRemainingTimeInSec] = useState();
  const [startTimeInSec, setStartTimeInSec] = useState(120); //change time here in future put deadline

  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const totalInSeconds = Math.floor(total / 1000);
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    setRemainingTimeInSec(totalInSeconds);

    return {
      total,
      hours,
      minutes,
      seconds,
    };
  };

  const startTimer = (e) => {
    let { total, hours, minutes, seconds } = getTimeRemaining(e);
    if (total >= 0) {
      // update the timer
      // check if less than 10 then we need to
      // add '0' at the beginning of the variable

      setTimer(
        (hours > 9 ? hours : '0' + hours) +
          ':' +
          (minutes > 9 ? minutes : '0' + minutes) +
          ':' +
          (seconds > 9 ? seconds : '0' + seconds)
      );
    }
  };

  const clearTimer = (e) => {
    // If you adjust it you should also need to
    // adjust the Endtime formula we are about
    // to code next
    setTimer('00:02:00'); //figure out how to set time here to in future

    // If you try to remove this line the
    // updating of timer Variable will be
    // after 1000ms or 1sec
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  const getDeadTime = () => {
    let deadline = new Date();

    // This is where you need to adjust if
    // you entend to add more time
    deadline.setSeconds(deadline.getSeconds() + startTimeInSec);
    return deadline;
  };

  function timeDiff(tstart, tend) {
    var diff = Math.floor((tend - tstart) / 1000),
      units = [
        { d: 60, l: 'seconds' },
        { d: 60, l: 'minutes' },
        { d: 24, l: 'hours' },
        { d: 365, l: 'days' },
      ];

    var s = '';
    for (var i = 0; i < units.length; ++i) {
      s = (diff % units[i].d) + ' ' + units[i].l + ' ' + s;
      diff = Math.floor(diff / units[i].d);
    }
    return s;
  }

  // We can use useEffect so that when the component
  // mount the timer will start as soon as possible

  // We put empty array to act as componentDid
  // mount only
  useEffect(() => {
    clearTimer(getDeadTime());
  }, []);

  // Another way to call the clearTimer() to start
  // the countdown is via action event from the
  // button first we create function to be called
  // by the button
  const onClickReset = () => {
    clearTimer(getDeadTime());
  };

  return (
    <div className="flex-col justify-end items-center">
      <div>
        <div className="text-3xl">{timer}</div>
        <div className="flex flex-row opacity-50">
          <Typography className="text-xs mr-1 ml-1 ">Hours</Typography>
          <Typography className="text-xs mx-1">Minutes</Typography>
          <Typography className="text-xs ml-1">Seconds</Typography>
        </div>
      </div>
      <div className="mt-5">
        <TimerBar
          passed={startTimeInSec - remainingTimeInSec}
          total={startTimeInSec}
        />
      </div>
    </div>
  );
};

export default Timer;
