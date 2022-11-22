import {
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  Zoom,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect, forwardRef } from 'react';
import Confetti from 'react-confetti';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function MagicMomentDialog({
  open,
  setOpen,
  reset,
  guessOne,
  guessTwo,
  event,
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setShowConfetti(false);
    } else {
      const timer = setTimeout(() => {
        setShowConfetti(true);
      }, 700);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [open]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      className="rounded-xl"
      open={open}
      onClose={() => {
        reset();
        setOpen(false);
      }}
      TransitionComponent={Transition}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>Success</DialogTitle>
      <DialogContent>
        {showConfetti && (
          <Confetti
            colors={['#5F45FD', '#462cf1']}
            recycle={false}
            numberOfPieces={2000}
          />
        )}
        <Stack spacing={2}>
          <Zoom
            in={open}
            style={{ transitionDelay: '500ms', transitionDuration: '600ms' }}
          >
            <div className="w-full flex items-center justify-around gap-1 my-10">
              <img
                src={`/api/betting/events/teamImage?id=${event.teamHome?.id}`}
                className="w-10 sm:w-20 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
              />
              <div className="relative">
                <h1 className="text-4xl sm:text-6xl whitespace-nowrap">
                  {guessOne} : {guessTwo}
                </h1>
                {guessOne == 6 && guessTwo == 9 && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                    <p className="animate-bounce bg-red-500 text-white rounded-full px-2">
                      Nice
                    </p>
                  </div>
                )}
              </div>
              <img
                src={`/api/betting/events/teamImage?id=${event.teamAway?.id}`}
                className="w-10 sm:w-20 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
              />
            </div>
          </Zoom>
          <h3 className="text-xl sm:text-2xl font-bold text-casama-blue text-center">
            {event.shortName}
          </h3>
          <h3 className="sm:text-xl font-bold text-center">
            {event.teamHome?.name} vs {event.teamAway?.name}
          </h3>
          <p className="text-center">Your Bet was placed successfully!</p>
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              className="w-full py-3 px-5 btn-default"
              onClick={() => router.push('/betting/bets')}
            >
              View My Bet
            </button>
            <button
              className="w-full py-3 px-5 btn-casama"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Place Another Bet
            </button>
          </div>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
