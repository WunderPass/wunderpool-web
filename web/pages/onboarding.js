import { useEffect, useState, forwardRef } from 'react';
import {
  Container,
  Typography,
  Dialog,
  DialogContent,
  Slide,
  Stack,
} from '@mui/material';
import DropDown from '/components/general/utils/dropDown';
import DemoEventCard from '../components/betting/events/eventCard/demo';
import { useTour } from '@reactour/tour';
import { useRouter } from 'next/router';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function WelcomeDialog({ setIsOpen }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      className="rounded-xl"
      open={open}
      TransitionComponent={Transition}
    >
      <DialogContent>
        <Stack spacing={2}>
          <img src="/casama_logo.png" className="w-20 mx-auto" />
          <h1 className="text-2xl text-center font-semibold">
            Welcome on Casama
          </h1>
          <p className="text-center text-casama-blue">
            At Casama you can bet on Sports Events with your friends. To see how
            it works, you can start the tutorial.
          </p>
          <p className="text-center text-gray-500">
            You can also skip it and bet right away.
          </p>
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              className="w-full py-3 px-5 btn-default"
              onClick={() => router.push('/betting')}
            >
              Skip Tutorial
            </button>
            <button
              className="w-full py-3 px-5 btn-casama"
              onClick={() => {
                setOpen(false);
                setIsOpen(true);
              }}
            >
              Start Tutorial
            </button>
          </div>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

const startDate = new Date(Number(new Date()) + 86400000);
const endDate = new Date(Number(new Date()) + 86400000);
startDate.setHours(20, 30, 0, 0);
endDate.setHours(22, 30, 0, 0);

const event = {
  id: 1,
  shortName: 'Soccer Competition',
  name: 'Soccer Competition - Germany vs. Spain',
  type: 'SOCCER',
  startTime: startDate.toISOString(),
  endTime: endDate.toISOString(),
  iconUrl: null,
  state: 'SETTLED',
  outcome: [0, 0],
  blockchainId: 1,
  version: 'BETA',
  competitionName: 'Soccer Competition',
  teamHome: {
    id: 1449,
    name: 'Germany',
  },
  teamAway: {
    id: 1438,
    name: 'Spain',
  },
};

const eventCompetitions = [
  {
    id: 1669212668391,
    name: 'Soccer Competition - Germany vs. Spain',
    version: 'BETA',
    poolAddress: '0xef7ca64ca316969ffb99a8437a61acb556bff5a3',
    isPublic: true,
    games: [
      {
        id: 1,
        state: 'UPCOMING',
        name: 'Soccer Competition - Germany vs. Spain',
        event: event,
        participants: [
          {
            address: '0x1a8459f9ddecabe92281ebdfa62874010a53fdc6',
            prediction: [1, 0],
            wunderId: 'g-fricke',
            userName: 'g-fricke',
            profileName: 'Gerwin Fricke',
          },
          {
            address: '0x097bf9d9a2c838e12fe153e4d7f83b48adb572c6',
            prediction: [0, 0],
            wunderId: 's-tschurilin',
            userName: 's-tschurilin',
            profileName: 'Slava Tschurilin',
          },
          {
            address: '0x7e0b49362897706290b7312d0b0902a1629397d8',
            prediction: [0, 1],
            wunderId: 'm-loechner',
            userName: 'm-loechner',
            profileName: 'Moritz Löchner',
          },
        ],
      },
    ],
    stake: 5,
    maxMembers: 50,
  },
  {
    id: 1669220911621,
    name: 'Soccer Competition - Germany vs. Spain',
    version: 'BETA',
    poolAddress: '0xa730434c2fe7f8d7da8bdd8a11c1fdf302b1b1c3',
    isPublic: true,
    games: [
      {
        id: 2,
        state: 'UPCOMING',
        name: 'Soccer Competition - Germany vs. Spain',
        event: event,
        participants: [
          {
            address: '0xe732f335f354b3918e8e38c957471a4b991abdc1',
            prediction: [0, 1],
            wunderId: 'WUNDER_BEXdoQtpgBSdE',
            userName: 'holy-jesus',
            profileName: 'Jesus Christus',
          },
          {
            address: '0x2b3012714ea223f87b712547c6e658af95650b3f',
            prediction: [3, 0],
            wunderId: 'm-winschuh',
            userName: 'm-winschuh',
            profileName: 'Matthias Winschuh',
          },
        ],
      },
    ],
    stake: 10,
    maxMembers: 50,
  },
  {
    id: 1669305899379,
    name: 'Soccer Competition - Germany vs. Spain',
    version: 'BETA',
    poolAddress: '0x25ad97c427eb8c98b2a6087881ffd02845deafd5',
    isPublic: true,
    games: [
      {
        id: 3,
        state: 'UPCOMING',
        name: 'Soccer Competition - Germany vs. Spain',
        event: event,
        participants: [],
      },
    ],
    stake: 50,
    maxMembers: 50,
  },
];

export default function Onboarding(props) {
  const [guessOne, setGuessOne] = useState('');
  const [guessTwo, setGuessTwo] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState({});

  const { setSteps, setIsOpen, setCurrentStep } = useTour();

  useEffect(() => {
    setSteps([
      {
        selector: '.react-tour-all-games',
        content:
          'This is the All Games Tab. Here you can find all Upcoming Games and place your Bets.',
        action: () => {
          setShowSuccess(false);
          setShowDetails(false);
          setSelectedCompetition({});
          setGuessOne('');
          setGuessTwo('');
        },
      },
      {
        selector: '.react-tour-my-bets',
        content:
          'Once you placed a Bet, you can find an Overview of your upcoming and historic Bets in this Tab.',
        action: () => {
          setShowSuccess(false);
          setShowDetails(false);
          setSelectedCompetition({});
          setGuessOne('');
          setGuessTwo('');
        },
      },
      {
        selector: '.react-tour-user-balance',
        content:
          'This is your Account Balance on Casama. Tapping here will show your options to send, receive, deposit or withdraw funds.',
        action: () => {
          setShowSuccess(false);
          setShowDetails(false);
          setSelectedCompetition({});
          setGuessOne('');
          setGuessTwo('');
        },
      },
      {
        selector: '.react-tour-event-card',
        content:
          "Let's place your first bet. Click on the highlighted section above to see all betting options. (No worries, this is not a real Game and only for testing purposes)",
        stepInteraction: true,
        resizeObservables: ['.react-tour-event-card'],
        action: () => {
          setShowSuccess(false);
          setShowDetails(false);
          setSelectedCompetition({});
          setGuessOne('');
          setGuessTwo('');
        },
      },
      {
        selector: '.react-tour-public-games',
        content:
          'You can choose how much you want to bet - $5, $10, or $50. For each tier, you can see how much is currently in the pot, how many spots are left and a preview of how your competitors bet.',
        action: () => {
          setShowSuccess(false);
          setShowDetails(true);
          setSelectedCompetition({});
          setGuessOne('');
          setGuessTwo('');
        },
      },
      {
        selector: '.react-tour-private-games',
        content:
          'You also have the option to start a private Competition and invite your friends to have a more private experience.',
        action: () => {
          setShowSuccess(false);
          setShowDetails(true);
          setSelectedCompetition({});
          setGuessOne('');
          setGuessTwo('');
        },
      },
      {
        selector: '.react-tour-public-games',
        content:
          'Choose an amount and enter your score prediction to place your first bet.',
        stepInteraction: true,
        resizeObservables: ['.react-tour-event-card'],
        action: () => {
          setShowSuccess(false);
          setShowDetails(true);
          setSelectedCompetition({});
          setGuessOne('');
          setGuessTwo('');
        },
      },
      {
        selector: '.react-tour-public-game',
        content:
          'Interesting Choice. Press the Blue Button again to place your bet.',
        stepInteraction: true,
        resizeObservables: ['.react-tour-public-games'],
        action: () => {
          setShowSuccess(false);
          setShowDetails(true);
          setSelectedCompetition((comp) =>
            comp.stake ? comp : { public: true, stake: 10 }
          );
          setGuessOne((guess) => guess || '2');
          setGuessTwo((guess) => guess || '0');
        },
      },
      {
        selector: 'body',
        position: 'left',
        content: 'Congrats! You just placed your first bet.',
        resizeObservables: ['body'],
        action: () => {
          setShowSuccess(true);
          setShowDetails(true);
          setSelectedCompetition((comp) =>
            comp.stake ? comp : { public: true, stake: 10 }
          );
          setGuessOne((guess) => guess || '2');
          setGuessTwo((guess) => guess || '0');
        },
      },
    ]);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (guessOne && guessTwo) setCurrentStep((step) => Math.max(7, step));
  }, [guessOne, guessTwo]);

  useEffect(() => {
    if (showDetails) setCurrentStep((step) => Math.max(4, step));
  }, [showDetails]);

  useEffect(() => {
    if (showSuccess) setCurrentStep(8);
  }, [showSuccess]);

  return (
    <>
      <div className="flex sm:flex-row flex-col font-graphik h-full">
        <Container>
          <div className="flex flex-row w-full justify-start ">
            <div className="flex flex-col w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:pt-10 sm:pb-10">
                <div className="flex flex-col">
                  <div className="flex flex-row items-center ">
                    <Typography className=" text-2xl mt-5 sm:text-4xl mb-2 font-medium">
                      Betting
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="sm:flex sm:flex-row">
                <div className="w-full pr-1 mb-8 mt-8 sm:mb-0 sm:mt-0 ">
                  <div className="flex flex-row items-center justify-between mb-3 h-14 w-full">
                    <Typography className="text-xl sm:text-3xl font-medium ">
                      Join a betting game
                    </Typography>
                    <DropDown list={['All Events']} value={'All Events'} />
                  </div>
                  <div className="grid grid-cols-1 gap-5 w-full">
                    <DemoEventCard
                      event={event}
                      eventCompetitions={eventCompetitions}
                      showDetails={showDetails}
                      setShowDetails={setShowDetails}
                      guessOne={guessOne}
                      setGuessOne={setGuessOne}
                      guessTwo={guessTwo}
                      setGuessTwo={setGuessTwo}
                      showSuccess={showSuccess}
                      setShowSuccess={setShowSuccess}
                      selectedCompetition={selectedCompetition}
                      setSelectedCompetition={setSelectedCompetition}
                      {...props}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <WelcomeDialog setIsOpen={setIsOpen} />
    </>
  );
}
