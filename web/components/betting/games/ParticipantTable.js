import { currency } from '/services/formatter';
import Avatar from '/components/general/members/avatar';
import { compAddr } from '../../../services/memberHelpers';

export function ParticipantTableRow({
  user,
  address,
  wunderId,
  userName,
  prediction,
  winnings,
  stake,
  hideImages,
}) {
  return (
    <div
      className={`${
        compAddr(address, user.address)
          ? 'container-casama-p-0'
          : 'container-white-p-0'
      } p-2 flex flex-row items-center justify-between gap-2 my-2 w-full`}
    >
      <div>
        <Avatar
          wunderId={hideImages ? '' : wunderId}
          tooltip={userName ? userName : 'user'}
          text={userName ? userName : '0X'}
        />
      </div>
      <div className="flex items-center justify-start truncate flex-grow">
        <div className="truncate">{userName || address}</div>
      </div>
      <div className="flex flex-row justify-end items-center text-xl">
        <p>{prediction?.[0] ?? '-'}</p>
        <p className="px-1">:</p>
        <p>{prediction?.[1] ?? '-'}</p>
      </div>
      {winnings != undefined && (
        <div className=" min-w-[5rem] text-right text-xl">
          {winnings > stake ? (
            <p className="text-green-500 whitespace-nowrap">
              + {currency(winnings)}
            </p>
          ) : (
            <p className="text-red-500 whitespace-nowrap">
              {stake - winnings == 0 ? '' : '-'} {currency(stake - winnings)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
export default function ParticipantTable({
  participants,
  stake,
  user,
  hideImages = false,
  hideLosers = false,
  headerText = 'Participants',
}) {
  return (
    <div className="">
      {participants.length > 0 && (
        <div className="text-gray-800 font-medium mt-3 ml-1 text-lg mb-1 ">
          {headerText}:
        </div>
      )}

      {(hideLosers ? participants.filter((p) => p.winnings > 0) : participants)
        .sort((a, b) => (b.winnings || 0) - (a.winnings || 0))
        .map(({ address, prediction, winnings, userName, wunderId }) => {
          return (
            <ParticipantTableRow
              key={`participant-${address}`}
              user={user}
              address={address}
              wunderId={wunderId}
              userName={userName}
              prediction={prediction}
              winnings={winnings}
              stake={stake}
              hideImages={hideImages}
            />
          );
        })}
    </div>
  );
}
