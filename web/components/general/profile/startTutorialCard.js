import { Divider } from '@mui/material';
import { useRouter } from 'next/router';

export default function StartTutorialCard() {
  const router = useRouter();

  return (
    <div className="container-white my-5">
      <div className="text-left w-full">
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-lg p-1 font-semibold">Casama Tutorial</h3>
        </div>
        <Divider className="w-full mt-2 mb-4" />
        <p className="">
          Click here to see how Casama works in an interactive Demo
        </p>
        <div className="w-full">
          <button
            onClick={() => router.push('/onboarding')}
            className="btn-casama px-5 py-2 block mx-auto mt-3"
          >
            Start Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
