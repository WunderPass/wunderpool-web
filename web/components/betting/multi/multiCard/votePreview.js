import { showWunderIdsAsIcons } from '../../../../services/memberHelpers';

function sortMembersOnVotes(participants) {
  let votes = null;
  if (!participants) return votes;
  if (participants.length > 0) {
    votes = [[], [], []];
    participants.forEach((p) => {
      if (Number(p.prediction[0]) > Number(p.prediction[1])) {
        votes[0].push(p);
      } else if (Number(p.prediction[0]) == Number(p.prediction[1])) {
        votes[1].push(p);
      } else if (Number(p.prediction[0]) < Number(p.prediction[1])) {
        votes[2].push(p);
      }
    });
  }
  return votes;
}

export default function EventCardVotePreview({ participants }) {
  const votes = sortMembersOnVotes(participants);
  return votes ? (
    <div className="w-full flex justify-around p-1 ">
      <div className="w-1/3 text-center">
        <p>Home</p>
        <div className="flex flex-row justify-center items-center ml-2 my-1 flex-wrap">
          {showWunderIdsAsIcons(votes[0], 2)}
        </div>
      </div>
      <div className="w-1/3 text-center">
        <p>Tie</p>
        <div className="flex flex-row justify-center items-center ml-2 my-1 flex-wrap">
          {showWunderIdsAsIcons(votes[1], 2)}
        </div>
      </div>

      <div className="w-1/3 text-center">
        <p>Away</p>
        <div className="flex flex-row justify-center items-center ml-2 my-1 flex-wrap">
          {showWunderIdsAsIcons(votes[2], 2)}
        </div>
      </div>
    </div>
  ) : null;
}

// OLD: No Wrapping

// export default function EventCardVotePreview({ participants }) {
//   const votes = sortMembersOnVotes(participants);
//   return votes ? (
//     <div className="w-full flex justify-around p-1 ">
//       <div className="w-full text-center">
//         <p>Home</p>
//         <div className="flex flex-row justify-center items-center ml-2 my-1">
//           {showWunderIdsAsIcons(votes[0], 2)}
//         </div>
//       </div>
//       <div className="w-full text-center">
//         <p>Tie</p>
//         <div className="flex flex-row justify-center items-center ml-2 my-1">
//           {showWunderIdsAsIcons(votes[1], 2)}
//         </div>
//       </div>

//       <div className="w-full text-center">
//         <p>Away</p>
//         <div className="flex flex-row justify-center items-center ml-2 my-1">
//           {showWunderIdsAsIcons(votes[2], 2)}
//         </div>
//       </div>
//     </div>
//   ) : null;
// }
