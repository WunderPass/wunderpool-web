import { AiOutlineInsertRowBelow } from 'react-icons/ai';
import { ImUngroup } from 'react-icons/im';
import Link from 'next/link';
import ReactourTarget from '../utils/reactourTarget';
import { GiAchievement } from 'react-icons/gi';
import { GiStack } from 'react-icons/gi';

export default function BottomBar() {
  return (
    <div className="fixed sm:hidden bottom-0 left-0 z-50 w-full">
      <div className="flex flex-row h-full w-full justify-around items-end text-white bg-casama-blue py-2">
        <Link href="/betting/bets">
          <a>
            <ReactourTarget name="my-bets" to="sm">
              <div className="flex flex-col items-center justify-center">
                <AiOutlineInsertRowBelow className="text-2xl" />
                <div className="text-base">My Bets</div>
              </div>
            </ReactourTarget>
          </a>
        </Link>
        <Link href="/betting">
          <a>
            <ReactourTarget name="all-games" to="sm">
              <div className="flex flex-col items-center justify-center">
                <ImUngroup className="text-2xl" />
                <div className="text-base">Single</div>
              </div>
            </ReactourTarget>
          </a>
        </Link>
        <Link href="/betting/multi">
          <a className="flex flex-col items-center justify-center">
            <GiStack className="text-2xl" />
            <div>Combo</div>
          </a>
        </Link>
        <Link href="/profile/rewards">
          <a className="flex flex-col items-center justify-center">
            <GiAchievement className="text-2xl" />
            <div>Rewards</div>
          </a>
        </Link>
      </div>
      <div
        className="bg-casama-blue w-full"
        style={{
          height: 'env(safe-area-inset-bottom)',
        }}
      />
    </div>
  );
}
