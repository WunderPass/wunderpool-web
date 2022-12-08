import { useEffect, useState } from 'react';
import ParticipantTable from '/components/betting/games/ParticipantTable';
import { calculateWinnings } from '/services/bettingHelpers';
import { toPng } from 'html-to-image';

export default function ShareCompetitionCard({
  competition,
  screenshotMode,
  setScreenshotMode,
  handleError,
  user,
}) {
  const [titleImgLoaded, setTitleImgLoaded] = useState(false);
  const [teamHomeImgLoaded, setTeamHomeImgLoaded] = useState(false);
  const [teamAwayImgLoaded, setTeamAwayImgLoaded] = useState(false);

  const { stake, sponsored, payoutRule, maxMembers, name } = competition || {};

  const firstGame = competition.games[0];
  const gameResults = calculateWinnings(
    firstGame,
    sponsored ? stake / maxMembers : stake,
    firstGame.event.outcome,
    payoutRule,
    sponsored
  );

  useEffect(async () => {
    if (!screenshotMode) return;
    if (titleImgLoaded && teamHomeImgLoaded && teamAwayImgLoaded) {
      try {
        const dataUrl = await toPng(
          document.getElementById(`share-competition-${competition.id}`),
          {
            includeQueryParams: true,
          }
        );
        if (navigator.share) {
          const imageObj = new File(
            [await (await fetch(dataUrl)).arrayBuffer()],
            `${name}.png`,
            { type: 'image/png' }
          );
          navigator.share({
            files: [imageObj],
          });
        } else {
          const link = document.createElement('a');
          link.download = `${name}.png`;
          link.href = dataUrl;
          link.click();
        }
      } catch (error) {
        handleError(error);
        console.log(error);
      }
      setScreenshotMode(false);
    }
  }, [screenshotMode, titleImgLoaded, teamHomeImgLoaded, teamAwayImgLoaded]);

  return (
    <div
      id={`share-competition-${competition.id}`}
      className={`p-3 bg-gray-100 flex-col justify-around gap-3 w-full max-w-md aspect-[9/16] ${
        screenshotMode ? 'flex' : 'hidden'
      }`}
    >
      <img
        src="/casama.svg"
        className="w-2/3 mx-auto"
        onLoad={() => setTitleImgLoaded(true)}
      />
      <div className="flex flex-col gap-3">
        <h1 className="font-semibold text-center text-lg">{name}</h1>
        <div className="flex flex-col w-full ml-2">
          {/* ICONS */}
          <div className="flex flex-row justify-between items-center text-center w-full">
            <div className="flex flex-col justify-center items-center text-center w-5/12">
              <img
                src={`/api/betting/events/teamImage?id=${firstGame.event.teamHome.id}`}
                className="w-20 mb-2"
                onLoad={() => setTeamHomeImgLoaded(true)}
              />
            </div>
            <p className="text-3xl font-semibold">vs</p>
            <div className="flex flex-col justify-center items-center text-center w-5/12">
              <img
                src={`/api/betting/events/teamImage?id=${firstGame.event.teamAway.id}`}
                className="w-20 mb-2"
                onLoad={() => setTeamAwayImgLoaded(true)}
              />
            </div>
          </div>

          {/* NAMEN */}
          <div className="flex flex-row justify-between items-center text-center mb-2 w-full">
            <div className="flex flex-row justify-center items-center text-center w-5/12">
              <p className="text-xl sm:text-2xl font-semibold">
                {firstGame.event.teamHome?.name || firstGame.event?.teamHome}
              </p>
            </div>
            <div className="flex flex-col justify-center items-center text-center w-5/12">
              <p className="text-xl sm:text-2xl font-semibold">
                {firstGame.event.teamAway?.name || firstGame.event?.teamAway}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-casama-blue text-white w-full flex flex-col justify-center items-center">
          <p className="mb-4 sm:mb-5 pb-1 sm:pb-2 mt-1 text-xl sm:text-2xl font-medium border-b border-gray-400 w-11/12 text-center">
            Result
          </p>
          <div className="flex flex-row justify-center items-center w-full mb-3">
            <p className="w-5/12 text-center text-base sm:text-xl px-2">
              {firstGame.event.teamHome.name}
            </p>

            <div className="w-2/12 flex flex-row justify-center">
              <p className="font-semibold text-xl sm:text-2xl">
                {firstGame.event?.outcome[0] || 0}
              </p>
              <p className="px-1 text-xl sm:text-2xl">:</p>
              <p className="font-semibold text-xl sm:text-2xl">
                {firstGame.event?.outcome[1] || 0}
              </p>
            </div>
            <p className="w-5/12 text-center text-base sm:text-xl px-2">
              {firstGame.event.teamAway.name}
            </p>
          </div>
        </div>
        <ParticipantTable
          participants={gameResults}
          stake={sponsored ? 0 : stake}
          user={user}
          hideImages
          hideLosers
          headerText="Winners"
        />
      </div>
      <div className="flex justify-center">
        <h6 className="text-xl text-center text-casama-blue font-bold bg-white p-3 rounded-xl whitespace-nowrap">
          🔗 app.casama.io
        </h6>
      </div>
    </div>
  );
}
