import { TourProvider, components } from '@reactour/tour';
import Link from 'next/link';
import { ReactNode } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

function Badge({ children }) {
  return (
    <components.Badge
      styles={{
        badge: (base) => ({ ...base, backgroundColor: '#5F45FD' }),
      }}
    >
      {children}
    </components.Badge>
  );
}

function Navigation({ steps, currentStep, setIsOpen, setCurrentStep }) {
  if (currentStep == steps.length - 1) {
    return (
      <div
        onClick={() => setIsOpen(false)}
        className="flex justify-center w-full mt-3"
      >
        <Link href="/betting">
          <button className="btn-casama py-2 px-3">Start Betting</button>
        </Link>
      </div>
    );
  }
  return (
    <div className="flex justify-between w-full mt-3">
      <FiArrowLeft
        onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
        className={`text-casama-blue text-2xl cursor-pointer ${
          currentStep == 0 ? 'opacity-0' : ''
        }`}
      />
      <FiArrowRight
        onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
        className="text-casama-blue text-2xl cursor-pointer"
      />
    </div>
  );
}

export default function ReactourProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TourProvider
      disableInteraction
      showDots={false}
      showCloseButton={false}
      badgeContent={({ totalSteps, currentStep }) =>
        `${currentStep + 1}/${totalSteps}`
      }
      onClickMask={({ setCurrentStep, currentStep }) =>
        setCurrentStep(currentStep + 1)
      }
      components={{ Badge, Navigation }}
      steps={[]}
    >
      {children}
    </TourProvider>
  );
}
