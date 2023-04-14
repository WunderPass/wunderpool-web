import { FormattedEvent } from '../../../../services/bettingHelpers';

function toDate(str: string | Date) {
  return str
    ? new Date(str).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      })
    : '---';
}

function toTime(str: string | Date) {
  return str
    ? new Date(str).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';
}

export default function EventCardHeader({
  event,
  specialEvent,
}: {
  event: FormattedEvent;
  specialEvent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-2 ">
      <div className="text-gray-500 text-base h-auto sm:h-14">
        {event.shortName}
        {specialEvent && (
          <span className="bg-gold-shiny font-semibold text-white rounded-md ml-2 py-1 px-3 whitespace-nowrap">
            Special Event
          </span>
        )}
      </div>
      <div className="flex h-auto sm:h-16 flex-row items-center mt-5 justify-between w-full text-lg ">
        <div className="flex flex-col w-5/12 items-center justify-center text-center gap-2">
          <img
            src={`/api/betting/events/teamImage?id=${event.teamHome?.id}`}
            className="w-16 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
          />
          <div className="font-semibold">{event.teamHome?.name}</div>
        </div>
        <div className="flex flex-col w-2/12 opacity-70 items-center justify-center">
          <div className="text-sm sm:text-lg">{toDate(event.startTime)}</div>
          <div className="text-sm sm:text-base">{toTime(event.startTime)}</div>
        </div>
        <div className="flex flex-col w-5/12 items-center justify-center text-center gap-2">
          <img
            src={`/api/betting/events/teamImage?id=${event.teamAway?.id}`}
            className="w-16 drop-shadow-[0_0_18px_rgba(0,0,0,0.15)]"
          />
          <div className="font-semibold">{event.teamAway?.name}</div>
        </div>
      </div>
    </div>
  );
}
