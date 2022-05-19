import { Typography } from '@mui/material';

function balanceBox(props) {
  return (
    <div className="sm:h-full sm:max-h-96 ">
      <div className="flex sm:h-full flex-col justify-between container-kaico mb-1 m:mr-8 w-full ">
        <Typography className="pb-6">Total Balance</Typography>
        <Typography className="text-3xl ">$12,223</Typography>

        <div className="flex flex-row items-center">
          <div className="h-3 w-3 mt-3 bg-red-500 rounded-sm mr-2" />
          <Typography className="pt-5 py-2 truncate">$14,745 Pool A</Typography>
        </div>
        <div className="flex flex-row items-center">
          <div className="h-3 w-3 bg-yellow-200 rounded-sm mr-2 " />
          <Typography className="py-2 truncate">
            $7,312 Pool BLABLABLABLABLABLABLA
          </Typography>
        </div>
        <div className="flex flex-row items-center">
          <div className="h-3 w-3 bg-pink-300 rounded-sm mr-2" />
          <Typography className="py-2 truncate">$1,000 Pool C</Typography>
        </div>

        <div className="relative pt-6">
          <div className="overflow-hidden h-10  text-xs flex rounded-lg bg-gray-200 ">
            <div
              style={{ width: '60%' }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
            ></div>
            <div
              style={{ width: '25%' }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-200"
            ></div>
            <div
              style={{ width: '15%' }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-300"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default balanceBox;
