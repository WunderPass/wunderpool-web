import { Box } from '@mui/material';
import { FaPercentage } from 'react-icons/fa';

export default function TimerBar(props) {
  const { passed, total } = props;

  function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
  }

  return (
    <>
      <div className="h-2.5 overflow-hidden text-xs flex rounded-full bg-white ">
        <div
          style={{
            width: percentage(passed, total) + '%',
          }}
          className="rounded-full shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-kaico-blue"
        ></div>
      </div>
    </>
  );
}
