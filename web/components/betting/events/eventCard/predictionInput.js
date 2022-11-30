import axios from 'axios';

export default function EventCardPredicitionInput(props) {
  const {
    event,
    loading,
    guessOne,
    guessTwo,
    setGuessOne,
    setGuessTwo,
    color = 'text-casama-blue',
  } = props;

  const getCountryIso = async (countryName) => {
    console.log('countryName', countryName);

    const iso = await axios({
      url: `/api/betting/metadata/countryIso?name=${countryName}`,
      // params: { query },
    });
    console.log('iso', iso);
    return 'dwad';
  };

  return (
    <>
      <div className="flex items-center justify-center mt-4">
        <p className={`${color}`}>Your Prediciton</p>
      </div>

      <div className="flex flex-row justify-between w-full mb-3">
        <div className="w-full flex flex-col items-center justify-center">
          <div>{(event?.teamHome?.name).substr(0, 3)}</div>
          {/* <div>{getCountryIso(event?.teamHome?.name)}</div> */}

          <div className="w-20">
            <input
              togglable="false"
              disabled={loading}
              inputMode="numeric"
              className="textfield text-center py-1 px-3"
              value={guessOne}
              onChange={(e) => setGuessOne(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <div>{(event?.teamAway?.name).substr(0, 3)}</div>
          <div className="w-20">
            <input
              togglable="false"
              disabled={loading}
              inputMode="numeric"
              className="textfield text-center py-1 px-3"
              value={guessTwo}
              onChange={(e) => setGuessTwo(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
