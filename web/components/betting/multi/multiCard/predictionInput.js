export default function MultiCardPredicitionInput(props) {
  const { competition, game, guessOne, guessTwo, setGuessOne, setGuessTwo, i } =
    props;

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
      <>
        <div className="flex flex-row justify-center w-full mb-3">
          {/* team one */}

          {/* score input */}
          <div className="flex flex-row justify-center items-center w-full">
            <div className="w-full flex flex-col items-center justify-center">
              <div className="w-32 ">
                <input
                  togglable="false"
                  inputMode="numeric"
                  className="textfield-score "
                  value={guessOne[i]}
                  onChange={(e) => updateFieldChangedOne(i, e)}
                />
              </div>
            </div>
            <div className="flex flex-row justify-center items-center">
              <p className="text-4xl sm:mx-10">:</p>
            </div>
            <div className="w-full flex flex-col items-center justify-center">
              <div className="w-32">
                <input
                  togglable="false"
                  inputMode="numeric"
                  className="textfield-score "
                  value={guessTwo[i]}
                  onChange={(e) => updateFieldChangedTwo(i, e)}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
