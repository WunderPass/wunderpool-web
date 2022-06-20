import { Typography } from '@mui/material';

export default function VotingBarBox(props) {
  const { yes, no, abstain, total } = props;
  const yesPercent = Math.round((yes * 100) / total);
  const noPercent = Math.round((no * 100) / total);
  const restPercent = 100 - yesPercent - noPercent;

  function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
  }

  return (
    <>
      <div className="container-white mb-6">
        <Typography className="mb-2">Voting results</Typography>

        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center my-1">
            <Typography className="w-12 text-xs">Yes</Typography>
            <div className="h-2 text-xs flex rounded-full bg-gray-200 w-1/2">
              <div
                style={{
                  width: percentage(yes, total) + '%',
                }}
                className="rounded-full shadow-none text-center whitespace-nowrap text-white justify-center bg-[#04CB5A]"
              ></div>
            </div>
            <Typography className="text-sm w-9">
              {percentage(yes, total).toFixed(1)}%
            </Typography>
          </div>
          <div className="flex flex-row justify-between items-center my-1">
            <Typography className="w-12 text-xs">No</Typography>
            <div className="h-2 text-xs flex rounded-full bg-gray-200 w-1/2">
              <div
                style={{
                  width: percentage(no, total) + '%',
                }}
                className="rounded-full shadow-none text-center whitespace-nowrap text-white justify-center bg-red-500"
              ></div>
            </div>
            <Typography className="text-sm w-9">
              {percentage(no, total).toFixed(1)}%
            </Typography>
          </div>{' '}
        </div>
      </div>
    </>
  );
}
