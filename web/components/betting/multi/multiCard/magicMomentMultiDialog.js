import {
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  Zoom,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect, forwardRef, useRef } from 'react';
import Confetti from 'react-confetti';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function MagicMomentMultiDialog({
  open,
  setOpen,
  reset,
  competition,
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  const paperRef = useRef(null);
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
        setOpen(open);
      }}
      PaperProps={{ ref: paperRef }}
      TransitionComponent={Transition}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>Success</DialogTitle>
      <DialogContent>
        {showConfetti && (
          <Confetti
            width={paperRef.current?.offsetWidth}
            height={paperRef.current?.offsetHeight}
            colors={['#5F45FD', '#462cf1']}
            recycle={false}
            numberOfPieces={2000}
          />
        )}

        <Stack spacing={2}>
          <h3 className="text-xl sm:text-2xl font-bold text-casama-blue text-center">
            {competition.shortName}
          </h3>

          <p className="text-center">Your Bet was placed successfully!</p>
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              togglable="false"
              className="w-full py-3 px-5 btn-default"
              onClick={() => router.push('/betting/bets')}
            >
              View My Bet
            </button>
            <button
              togglable="false"
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
