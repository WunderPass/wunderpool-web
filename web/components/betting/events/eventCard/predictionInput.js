import axios from 'axios';
import { useEffect, useState } from 'react';

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

  const [homeCountryIso, setHomeCountryIso] = useState(null);
  const [awayCountryIso, setAwayCountryIso] = useState(null);

  //TODO ASK MORITZ HOW HE WOULD SOLVE THIS SHIT
  // const fetchCountryHomeIso = async (country) => {
  //   try {
  //     const { data } = await axios({
  //       url: `/api/betting/metadata/countryIso?name=${country}`,
  //       // params: { query },
  //     });
  //     setHomeCountryIso(data);
  //   } catch (error) {
  //     console.log('error', 'gukus');
  //   }
  // };

  // const fetchCountryAwayIso = async (country) => {
  //   try {
  //     const { data } = await axios({
  //       url: `/api/betting/metadata/countryIso?name=${country}`,
  //       // params: { query },
  //     });
  //     setAwayCountryIso(data);
  //   } catch (error) {
  //     console.log('error', 'gukus');
  //   }
  // };

  useEffect(() => {
    // fetchCountryHomeIso(event?.teamHome?.name);
    // fetchCountryAwayIso(event?.teamAway?.name);
  }, []);

  return (
    <>
      <div className="flex items-center justify-center mt-4">
        <p className={`${color}`}>Your Prediciton</p>
      </div>

      <div className="flex flex-row justify-between w-full mb-3">
        <div className="w-full flex flex-col items-center justify-center">
          <div>
            {homeCountryIso
              ? homeCountryIso
              : (event?.teamHome?.name).substr(0, 3)}
          </div>

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
          <div>
            {awayCountryIso
              ? awayCountryIso
              : (event?.teamAway?.name).substr(0, 3)}
          </div>
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
