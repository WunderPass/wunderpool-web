import { currency } from '/services/formatter';
import Avatar from '/components/general/members/avatar';
import { compAddr } from '../../../services/memberHelpers';

export default function ParticipantTable({ participants, stake, user }) {
  return (
    <div className="">
      {participants.length > 0 && (
        <div className="text-gray-800 font-medium mt-3 ml-1 text-lg mb-1 ">
          Participants :
        </div>
      )}

      {participants
        .sort((a, b) => b.winnings || 0 - a.winnings || 0)
        .map(
          (
            { address, prediction, winnings, userName, wunderId, profileName },
            i
          ) => {
            return (
              <div
                key={`participant-${address}`}
                className={`${
                  compAddr(address, user.address)
                    ? 'container-casama-p-0'
                    : 'container-white-p-0'
                } p-2 flex flex-row items-center justify-between gap-2 my-2 w-full`}
              >
                <div>
                  <Avatar
                    wunderId={wunderId}
                    tooltip={userName}
                    text={userName ? userName : '0X'}
                    i={i}
                  />
                </div>
                <div className="flex items-center justify-start truncate flex-grow">
                  <div className="truncate">
                    {profileName || userName || address}
                  </div>
                </div>
                <div className="flex flex-row justify-end items-center text-xl">
                  <p>{prediction[0]}</p>
                  <p className="px-1">:</p>
                  <p>{prediction[1]}</p>
                </div>
                {winnings != undefined && (
                  <div className=" min-w-[5rem] text-right text-xl">
                    {winnings >= stake ? (
                      <p className="text-green-500">{currency(winnings)}</p>
                    ) : (
                      <p className="text-red-500">
                        {currency(stake - winnings)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          }
        )}
    </div>
  );
}