import { Stack, Typography, IconButton, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ShareIcon from '@mui/icons-material/Share';
import { handleShare } from '/services/shareLink';
import { getEnsNameFromAddress } from '/services/memberHelpers';
import usePool from '/hooks/usePool';

export default function EventCard(props) {
  const { event, handleSuccess, user } = props;
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="container-white pb-16 ">
      <div className="flex flex-col items-center justify-center mt-2 mb-5">
        <div className="opacity-50"> Group A</div>
        <div className="flex flex-row items-center justify-between w-full text-2xl">
          <div className="flex flex-row lg:flex-col ">
            <div>Katar</div>
            <div>Flag</div>
          </div>
          <div className="flex flex-col opacity-70 items-center justify-center ">
            <div className="text-lg">Oct 21</div>
            <div className="text-base">21:00</div>
          </div>
          <div className="flex flex-row lg:flex-col ">
            <div>Flag</div>
            <div>Ecu</div>
          </div>
        </div>
      </div>
      <Divider />
      <div className="my-5">
        <div className="flex justify-center items-center text-semibold text-lg">
          Public Betting Games
        </div>
        <div>
          <div className="opacity-70 mb-2">Enter a bet:</div>
          <div className="flex flex-row w-full gap-3">
            <div className="flex flex-col container-casama-light-p-0 items-between p-3 w-full">
              <div className="flex flex-row justify-between items-center p-2">
                <div className="text-casama-blue font-semibold">5€</div>
                <div className="opacity-50 text-sm">47/50</div>
              </div>
              <button className="btn-casama px-6 p-1">Join</button>
            </div>
            <div className="flex flex-col container-casama-light-p-0 items-between p-3 w-full">
              <div className="flex flex-row justify-between items-center p-2">
                <div className="text-casama-blue font-semibold">15€</div>
                <div className="opacity-50 text-sm">47/50</div>
              </div>
              <button className="btn-casama px-6 p-1">Join</button>
            </div>
            <div className="flex flex-col container-casama-light-p-0 items-between p-3 w-full">
              <div className="flex flex-row justify-between items-center p-2">
                <div className="text-casama-blue font-semibold">50€</div>
                <div className="opacity-50 text-sm">47/50</div>
              </div>
              <button className="btn-casama px-6 p-1">Join</button>
            </div>
          </div>
        </div>
      </div>
      <Divider />
      <div className="flex flex-col justify-center items-center my-5">
        <div className=" text-semibold text-lg mb-4">
          Create a private Betting Game
        </div>

        <div className="flex flex-row w-full gap-3">
          <button className="btn-casama w-full p-2"> 5€ </button>
          <button className="btn-casama w-full p-2"> 10€</button>
          <button className="btn-casama w-full p-2"> Custom €</button>
        </div>
      </div>
    </div>
  );
}
