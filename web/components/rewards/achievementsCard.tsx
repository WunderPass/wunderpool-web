import {
  Divider,
  LinearProgress,
  linearProgressClasses,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CgClose } from 'react-icons/cg';
import { BiCheck } from 'react-icons/bi';
import Link from 'next/link';
import { BrowserView, MobileView } from 'react-device-detect';

type AchievementsCardProps = {
  title: string;
  description: string;
  bonus: string;
  button: string;
  progress: number;
  maxProgress: number;
} & (
  | {
      callToAction: () => void;
      isButton: true;
    }
  | {
      callToAction: string;
      isButton?: false;
    }
);

export default function AchievementsCard(props: AchievementsCardProps) {
  const {
    title,
    description,
    bonus,
    button,
    progress,
    maxProgress,
    callToAction,
    isButton,
  } = props;

  let challengeCompleted = progress == maxProgress;

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === 'light' ? 300 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: theme.palette.mode === 'light' ? '#5F45FD' : '#5F45FD',
    },
  }));

  return (
    <div
      className={
        challengeCompleted
          ? 'container-white my-5 sm:my-10 opacity-40'
          : 'container-white my-5 sm:my-10'
      }
    >
      <div className="flex flex-row items-stretch text-left w-full ">
        <div className="w-full">
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-xl pt-2 pb-5 font-semibold">{title}</h2>
          </div>
          <p className="">
            {description}
            <span className="text-casama-blue"> {bonus}</span>.
          </p>

          <BrowserView>
            <Divider className="w-full mt-2 mb-4" />
            <div className="flex flex-row items-center justify-between">
              <Grid spacing={1} container>
                <Grid xs item>
                  <BorderLinearProgress
                    variant="determinate"
                    value={(progress / maxProgress) * 100}
                  />
                </Grid>
              </Grid>
              <div className="flex justify-end  w-12">
                {progress} / {maxProgress}
              </div>
            </div>
            {isButton == true ? (
              <button
                disabled={challengeCompleted}
                onClick={callToAction}
                className="btn-casama px-5 mt-5 py-2  w-full"
              >
                {button}
              </button>
            ) : (
              <Link href={challengeCompleted ? '' : callToAction}>
                <div
                  className={
                    challengeCompleted
                      ? 'cursor-disabled flex justify-center items-center btn-casama px-5 mt-5 py-2 w-full'
                      : 'flex justify-center items-center btn-casama px-5 mt-5 py-2 w-full'
                  }
                >
                  {button}
                </div>
              </Link>
            )}
          </BrowserView>
        </div>
        <div className="flex flex-row items-center">
          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            className="mx-3 sm:mx-6"
          />

          {!challengeCompleted ? (
            <div className="container-round-transparent bg-gray-400 p-2.5 opacity-40">
              <CgClose className="text-3xl sm:text-5xl" />
            </div>
          ) : (
            <div className="container-round-transparent bg-green-300  opacity-60">
              <BiCheck className="text-5xl sm:text-7xl text-green-700" />
            </div>
          )}
        </div>
      </div>
      <MobileView>
        <Divider className="w-full mt-2 mb-4" />
        <div className="flex flex-row items-center justify-between">
          <Grid spacing={1} container>
            <Grid xs item>
              <BorderLinearProgress
                variant="determinate"
                value={(progress / maxProgress) * 100}
              />
            </Grid>
          </Grid>
          <div className="flex justify-end  w-12">
            {progress} / {maxProgress}
          </div>
        </div>
        {isButton == true ? (
          <button
            disabled={challengeCompleted}
            onClick={callToAction}
            className="btn-casama px-5 mt-5 py-2  w-full"
          >
            {button}
          </button>
        ) : (
          <Link href={challengeCompleted ? '' : callToAction}>
            <div
              className={
                challengeCompleted
                  ? 'cursor-disabled flex justify-center items-center btn-casama px-5 mt-5 py-2 w-full'
                  : 'flex justify-center items-center btn-casama px-5 mt-5 py-2 w-full'
              }
            >
              {button}
            </div>
          </Link>
        )}
      </MobileView>
    </div>
  );
}
