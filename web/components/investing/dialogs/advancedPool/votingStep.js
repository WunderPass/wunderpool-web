import { DialogContentText, Stack, Typography, Switch } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

function OptionButton({ option, value, onClick, hidden }) {
  const wrapperClass =
    !option.value && hidden
      ? 'hidden'
      : 'flex items-center justify-center w-full';
  const buttonClass =
    option.value == value
      ? 'bg-gray-200 text-black text-sm py-2 px-2 rounded-lg w-full'
      : 'text-black text-sm py-2 px-2 rounded-lg w-full';

  return (
    <div className={wrapperClass}>
      <button className={buttonClass} onClick={() => onClick(option.value)}>
        {option.label}
      </button>
    </div>
  );
}

function CustomInput({ show, value, placeholder, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [show]);

  return (
    <div
      className={show ? 'flex items-center justify-center w-full' : 'hidden'}
    >
      <input
        ref={inputRef}
        value={value}
        className="bg-gray-200 text-black text-sm px-2 rounded-lg w-full py-2 text-center"
        type="text"
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}

export default function NewPoolVotingStep(props) {
  const {
    votingEnabled,
    setVotingEnabled,
    votingTime,
    setVotingTime,
    votingThreshold,
    setVotingThreshold,
    minYesVoters,
    setMinYesVoters,
    showCustomDuration,
    setShowCustomDuration,
    showCustomPercent,
    setShowCustomPercent,
    showCustomPerson,
    setShowCustomPerson,
  } = props;

  const VotingDurations = [
    { label: '6h', value: '6' },
    { label: '24h', value: '24' },
    { label: '3d', value: '72' },
    { label: 'Custom', value: null },
  ];

  const VotingThresholds = [
    { label: '> 50%', value: '50' },
    { label: 'Custom', value: null },
  ];

  const MinVoters = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: 'Custom', value: null },
  ];

  const handleVotingTime = (duration) => {
    if (duration) {
      setVotingTime(duration);
      setShowCustomDuration(false);
    } else {
      setVotingTime(null);
      setShowCustomDuration(true);
    }
  };

  const handleVotingThreshold = (threshold) => {
    if (threshold) {
      setVotingThreshold(threshold);
      setShowCustomPercent(false);
    } else {
      setVotingThreshold(null);
      setShowCustomPercent(true);
    }
  };

  const handleMinVoters = (minVoters) => {
    if (minVoters) {
      setMinYesVoters(minVoters);
      setShowCustomPerson(false);
    } else {
      setMinYesVoters(null);
      setShowCustomPerson(true);
    }
  };

  return (
    <Stack spacing={1}>
      <DialogContentText className="text-sm mb-7 font-graphik w-full">
        Step 2 of 3 | Voting Rules
      </DialogContentText>

      <div className="flex flex-row justify-between  items-center pb-4">
        <Typography className="text-xl">Votings</Typography>
        <Switch
          id="votingSwitch"
          checked={votingEnabled}
          onClick={() => setVotingEnabled((val) => !val)}
        />
      </div>

      <div className={votingEnabled ? '' : 'opacity-20'}>
        <div className="pb-4 w-full">
          <label className="label pb-1" htmlFor="value">
            Duration of voting
          </label>
          <div
            id="durationVotings"
            className="flex flex-row textfield py-2 justify-between mt-2"
          >
            {VotingDurations.map((option, i) => {
              return (
                <OptionButton
                  key={`voting-time-option-${i}`}
                  option={option}
                  value={votingTime}
                  onClick={handleVotingTime}
                  hidden={showCustomDuration}
                />
              );
            })}
            <CustomInput
              show={showCustomDuration}
              value={votingTime}
              placeholder="in hours.."
              onChange={(e) => {
                const time = Number(e.target.value);
                setVotingTime(Math.max(time, 0) || '');
              }}
            />
          </div>
        </div>

        <div className="pb-4">
          <label className="label pb-1 sm:mr-52" htmlFor="value">
            How many % is needed to win a vote
          </label>
          <div className="flex flex-row textfield py-2 justify-between mt-2">
            {VotingThresholds.map((option, i) => {
              return (
                <OptionButton
                  key={`voting-threshold-option-${i}`}
                  option={option}
                  value={votingThreshold}
                  onClick={handleVotingThreshold}
                  hidden={showCustomPercent}
                />
              );
            })}
            <CustomInput
              show={showCustomPercent}
              value={votingThreshold}
              placeholder="in %.."
              onChange={(e) => {
                const threshold = Number(e.target.value);
                setVotingThreshold(Math.min(Math.max(threshold, 0), 100) || '');
              }}
            />
          </div>
        </div>

        <div className="pb-4">
          <label className="label pb-1 sm:mr-52" htmlFor="value">
            How many people have to vote YES
          </label>
          <div className="flex flex-row textfield py-2 justify-between mt-2">
            {MinVoters.map((option, i) => {
              return (
                <OptionButton
                  key={`voting-min-voters-option-${i}`}
                  option={option}
                  value={minYesVoters}
                  onClick={handleMinVoters}
                  hidden={showCustomPerson}
                />
              );
            })}
            <CustomInput
              show={showCustomPerson}
              value={minYesVoters}
              placeholder="in persons.."
              onChange={(e) => {
                const voters = Number(e.target.value);
                setMinYesVoters(Math.min(Math.max(voters, 0), 50) || '');
              }}
            />
          </div>
        </div>
      </div>
    </Stack>
  );
}
