import { currency } from '../../../../services/formatter';
import Link from 'next/link';

export default function MulitCardSubmitButton({
  user,
  loading,
  placeBet,
  disabled,
  competition,
}) {
  return (
    <>
      {competition.members.find((member) => member.address == user.address) ? ( //if part of pool
        competition.games[0].participants.find(
          //if part of bets
          (p) => p.address == user.address
        ) ? (
          <div className="flex flex-col justify-center items-center w-full">
            <p className="mb-4 ">
              (You already placed your bets for this competition)
            </p>
            <div className="flex items-center justify-center w-full ">
              <Link
                href={`/betting/bets`} //TODO add ?sortId=${competition.competitionId}`
              >
                <button
                  togglable="false"
                  className="btn-casama rounded-xl hover:opacity-80 w-full py-3 text-lg my-2"
                >
                  <p className="text-2xl">View your placed bet</p>
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full ">
            <div className="flex flex-col justify-center items-center w-full">
              <p className="mb-8 text-red-600">
                (Your previous attempt to place your bets failed, please try
                again!)
              </p>

              <button
                togglable="false"
                disabled={loading || disabled}
                className={
                  loading || disabled
                    ? 'btn-casama rounded-xl hover:opacity-80 w-full py-3 text-lg my-2'
                    : 'bg-casama-shiny rounded-xl hover:opacity-80 w-full py-3 text-lg my-2'
                }
                onClick={placeBet}
              >
                <p className="text-2xl">
                  Place all your bets for ${competition.stake}
                </p>
              </button>
            </div>
          </div>
        )
      ) : (
        //if not part of anything
        <div className="flex items-center justify-center w-full ">
          <div className="flex flex-col justify-center items-center w-full">
            <p className="mb-8">(Enter your score predictions for all games)</p>

            <button
              togglable="false"
              disabled={loading || disabled}
              className={
                loading || disabled
                  ? 'btn-casama rounded-xl hover:opacity-80 w-full py-3 text-lg my-2'
                  : 'bg-casama-shiny rounded-xl hover:opacity-80 w-full py-3 text-lg my-2'
              }
              onClick={placeBet}
            >
              <p className="text-2xl">
                Place all your bets for ${competition.stake}
              </p>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
