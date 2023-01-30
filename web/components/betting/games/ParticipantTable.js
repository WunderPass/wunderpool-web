import { currency } from '/services/formatter';
import Avatar from '/components/general/members/avatar';
import { compAddr } from '../../../services/memberHelpers';
import { useEffect, useState } from 'react';

export function ParticipantTableRow({
  user,
  address,
  wunderId,
  userName,
  prediction,
  winnings,
  stake,
  hideImages,
  points,
  profit,
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
      <div className="flex flex-row items-center text-xl">
        <div className="flex flex-row justify-end items-center ">
          <p>{prediction?.[0] ?? '-'}</p>
          <p className="px-1">:</p>
          <p>{prediction?.[1] ?? '-'}</p>
        </div>
        <div
          className={
            points > 0
              ? 'text-green-500 text-sm mt-3 ml-0.5 font-medium'
              : 'text-red-500 text-sm mt-3  ml-0.5 font-medium'
          }
        >
          <div className="flex flex-row">
            <p>{points}</p> <p className="font-gray-800 ml-0.5"></p>
          </div>
        </div>
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
      {participants && participants.length > 0 && (
        <div className="text-gray-800 font-medium mt-3 ml-1 text-lg mb-1 ">
          {headerText}:
        </div>
      )}

      {participants &&
        (hideLosers ? participants.filter((p) => p.winnings > 0) : participants)
          .sort((a, b) => (b.points || 0) - (a.points || 0))
          .map(
            ({
              address,
              prediction,
              winnings,
              userName,
              wunderId,
              points,
              profit,
            }) => {
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
                  points={points}
                  profit={profit}
                />
              );
            }
          )}
    </div>
  );
}

export function PointsTable({
  competition,
  participants,
  stake,
  user,
  hideImages = false,
  hideLosers = false,
}) {
  const [totalPointsMap, setTotalPointsMap] = useState(new Map());

  const updateTotalPointsMap = (k, v) => {
    setTotalPointsMap(new Map(totalPointsMap.set(k, v)));
  };

  const calculateTotalPoints = () => {
    competition.games.map((game) => {
      game.participants.map((p) => {
        updateTotalPointsMap(
          p.address,
          p.points + totalPointsMap.get(p.address)
        );
      });
    });
  };

  const initMap = () => {
    competition.games.map((game) => {
      game.participants.map((p) => {
        if (totalPointsMap.get(p.address) === undefined) {
          updateTotalPointsMap(p.address, 0);
        }
      });
    });
  };

  useEffect(() => {
    initMap();
    calculateTotalPoints();
  }, []);

  return (
    <div className="">
      {participants && participants.length > 0 && (
        <div className="text-gray-800 font-medium mt-3 ml-1 text-lg mb-1 "></div>
      )}
      {participants &&
        participants
          .sort(
            (a, b) =>
              (totalPointsMap.get(b.address) || '-') -
              (totalPointsMap.get(a.address) || '-')
          )
          .map(({ address, points, winnings, userName, wunderId }, i) => {
            return (
              <PointsTableRow
                totalPointsMap={totalPointsMap}
                competition={competition}
                key={`participant-${address}`}
                user={user}
                address={address}
                wunderId={wunderId}
                userName={userName}
                points={points}
                winnings={winnings}
                stake={stake}
                hideImages={hideImages}
                i={i}
              />
            );
          })}
    </div>
  );
}

export function PointsTableRow({
  totalPointsMap,
  competition,
  user,
  address,
  wunderId,
  userName,
  winnings,
  stake,
  hideImages,
  points,
  i,
}) {
  let totalPoints = 0;
  totalPoints = competition.games.map((game) => {
    game.participants.points + totalPoints;
  });

  return (
    <div
      className={`${
        compAddr(address, user.address) ? '' : ''
      }  flex flex-row items-center justify-between gap-2 my-2 w-full`}
    >
      <div className="flex flex-row justify-center items-center">
        <p className="flex pr-2 text-xl font-medium text-gray-700 w-6">
          {i + 1}.
        </p>
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
        <p>{totalPoints}</p>

        <p className="flex text-2xl font-medium text-casama-blue ">
          {totalPointsMap.get(address) || 0}
        </p>
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
