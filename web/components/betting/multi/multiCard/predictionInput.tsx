import { Dispatch, SetStateAction } from 'react';
import { MultiBetFormat } from '../../../../services/contract/betting/games';

type MultiCardPredicitionInput = {
  bets: MultiBetFormat[];
  setBets: Dispatch<SetStateAction<MultiBetFormat[]>>;
  gameId: number;
};

export default function MultiCardPredicitionInput(
  props: MultiCardPredicitionInput
) {
  const { bets, setBets, gameId } = props;

  const bet = bets.find(({ game_id }) => game_id == gameId);
  const { home_score, guest_score } = bet || {};

  const updateGuess = (params: {
    home_score?: number;
    guest_score?: number;
  }) => {
    if (bet) {
      setBets((bts) =>
        bts.map((bet) => (bet.game_id == gameId ? { ...bet, ...params } : bet))
      );
    } else {
      setBets((bts) => [...bts, { game_id: gameId, ...params }]);
    }
  };

  return (
    <div>
      <div className="flex flex-row justify-center w-full mb-3">
        <div className="flex flex-row justify-center items-center w-full">
          <div className="w-full flex flex-col items-center justify-center">
            <div className="w-32 ">
              <input
                inputMode="numeric"
                className="textfield-score "
                value={home_score}
                onChange={(e) =>
                  updateGuess({ home_score: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="flex flex-row justify-center items-center">
            <p className="text-4xl sm:mx-10 mx-1">:</p>
          </div>
          <div className="w-full flex flex-col items-center justify-center">
            <div className="w-32">
              <input
                inputMode="numeric"
                className="textfield-score "
                value={guest_score}
                onChange={(e) =>
                  updateGuess({ guest_score: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
