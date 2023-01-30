import { currency } from '../../../../services/formatter';
import { GoPerson } from 'react-icons/go';
import { FaMedal } from 'react-icons/fa';

export default function MultitCardHeader(props) {
  const { competition, user } = props;

  return (
    <div className="flex flex-col items-center justify-center text-center mt-2 ">
      <div className="flex flex-col text-gray-500 text-xl h-auto sm:h-5">
        <span className="text-gray-800 font-medium text-2xl">
          {competition.name}
        </span>
        <span>({competition.games.length} games in competition)</span>
      </div>
      <div className="flex flex-row justify-between items-center px-3 sm:mt-16 mt-2 -mb-10 sm:px-2 ">
        <div className="flex flex-row">
          <div className="flex flex-row justify-center items-center">
            <FaMedal className="text-2xl text-yellow-600 mb-0.5 mr-1" />
            <p className="font-semibold  text-2xl">
              {currency(
                competition?.stake *
                  competition?.games?.[0]?.participants?.length || 0
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-row">
          <div className="font-semibold ml-6">
            <div className="flex flex-row text-2xl items-center justify-center">
              <GoPerson className="text-2xl text-casama-blue mb-0.5 mr-1" />
              {competition.members.length} / {competition.maxMembers}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between items-center mt-16">
        {competition.games.map((game, i) => {
          if (i <= 9)
            return (
              <>
                <div className="flex flex-col mt-1">
                  <img
                    src={`/api/betting/events/teamImage?id=${game.event?.teamHome?.id}`}
                    className="w-12 mx-0.5 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)] mb-4"
                  />
                  <img
                    src={`/api/betting/events/teamImage?id=${game.event?.teamAway?.id}`}
                    className="w-12 mx-0.5 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
                  />
                </div>
              </>
            );
        })}
      </div>

      <>
        {competition.members.find((member) => member.address == user.address) && //if part of pool
          competition.games[0].participants.find(
            //if part of bets
            (p) => p.address == user.address
          ) && (
            <div className="flex items-center justify-center w-full ">
              <div className="flex flex-col justify-center items-center w-full">
                <p className="mt-6 text-red-600 text-lg">
                  (Your previous attempt to place your bets failed, please try
                  again!)
                </p>
              </div>
            </div>
          )}
      </>
    </div>
  );
}
