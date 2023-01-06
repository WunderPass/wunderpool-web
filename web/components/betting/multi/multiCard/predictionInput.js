export default function MultiCardPredicitionInput(props) {
  const {
    competition,
    event,
    loading,
    guessOne,
    guessTwo,
    setGuessOne,
    setGuessTwo,
    color = 'text-casama-blue',
  } = props;

  const updateFieldChangedOne = (index, e) => {
    let newArr = [...guessOne];
    newArr[index] = e.target.value;
    setGuessOne(newArr);
  };

  const updateFieldChangedTwo = (index, e) => {
    let newArr = [...guessTwo];
    newArr[index] = e.target.value;
    setGuessTwo(newArr);
  };

  return (
    <div>
      {competition.games.map((game, i) => {
        return (
          <>
            <div className="flex flex-row justify-center w-full mb-3">
              {/* team one */}

              {/* score input */}
              <div className="flex flex-row justify-center items-center w-full">
                <div className="w-full flex flex-col items-center justify-center">
                  <div>{game.event?.teamHome?.shortName}</div>
                  <div className="w-20">
                    <input
                      togglable="false"
                      disabled={loading}
                      inputMode="numeric"
                      className="textfield text-center py-1 px-3"
                      value={guessOne[i]}
                      onChange={(e) => updateFieldChangedOne(i, e)}
                    />
                  </div>
                </div>
                <div className="flex flex-row justify-center items-center">
                  <p>:</p>
                </div>
                <div className="w-full flex flex-col items-center justify-center">
                  <div>{game.event?.teamAway?.shortName}</div>
                  <div className="w-20">
                    <input
                      togglable="false"
                      disabled={loading}
                      inputMode="numeric"
                      className="textfield text-center py-1 px-3"
                      value={guessTwo[i]}
                      onChange={(e) => updateFieldChangedTwo(i, e)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })}
    </div>
  );
}
