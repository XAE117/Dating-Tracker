import { Avatar, FlagBadge, formatDateDisplay, daysBetween, todayISO } from './shared';

export default function PersonList({ people, onEdit, onDelete, showEnrichment = false }) {
  if (people.length === 0) {
    return <div className="text-center text-neutral-500 py-12">No one here yet</div>;
  }

  // Group by year
  const groupedByYear = people.reduce((acc, person) => {
    const date = person.dateStarted || person.dateEnded;
    const year = date ? date.split('-')[0] : 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(person);
    return acc;
  }, {});
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b.localeCompare(a));

  return sortedYears.map(year => (
    <div key={year} className="mb-6">
      <h2 className="text-lg font-semibold text-neutral-400 mb-3 sticky top-28 bg-neutral-950 py-2">{year}</h2>
      <div className="space-y-3">
        {groupedByYear[year].map(person => (
          <PersonCard key={person.id} person={person} onEdit={onEdit} onDelete={onDelete} showEnrichment={showEnrichment} />
        ))}
      </div>
    </div>
  ));
}

function PersonCard({ person, onEdit, onDelete, showEnrichment }) {
  const days = person.dateStarted && person.status !== 'ended'
    ? daysBetween(person.dateStarted, todayISO())
    : person.dateStarted && person.dateEnded
      ? daysBetween(person.dateStarted, person.dateEnded)
      : null;

  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 flex gap-4"
      onClick={() => onEdit(person)}>
      <Avatar person={person} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-lg">{person.name}</h3>
              {person.metInPerson && (
                <span className="px-2 py-0.5 bg-green-900 text-green-300 text-xs rounded-full font-medium">Met</span>
              )}
              {person.status === 'paused' && (
                <span className="px-2 py-0.5 bg-yellow-900 text-yellow-300 text-xs rounded-full font-medium">Paused</span>
              )}
            </div>
            <p className="text-sm text-neutral-500">
              {person.platform && `${person.platform} · `}
              {formatDateDisplay(person.dateStarted)}
              {person.dateEnded && ` → ${formatDateDisplay(person.dateEnded)}`}
            </p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onDelete(person); }}
            className="text-red-400 text-sm px-2">Delete</button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
          <span className="text-yellow-400">{'★' + person.interestRating}</span>
          <span>Future: {person.futureLikelihood}/10</span>
          {person.metInPerson && person.numberOfDates > 0 && (
            <span>{person.numberOfDates} date{person.numberOfDates !== 1 ? 's' : ''}</span>
          )}
          {days !== null && <span className="text-neutral-500">{days}d</span>}
          {person.endedBy && <span className="text-neutral-500">Ended: {person.endedBy}</span>}
        </div>

        {/* Enrichment badges */}
        {showEnrichment && (person.energy || person.messageCount) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {person.energy && (
              <span className={`px-2 py-0.5 rounded-full ${
                person.energy === 'Energizing' ? 'bg-green-900 text-green-300' :
                person.energy === 'Draining' ? 'bg-red-900 text-red-300' :
                'bg-neutral-800 text-neutral-400'
              }`}>{person.energy === 'Energizing' ? '⚡' : person.energy === 'Draining' ? '🔻' : '➖'} {person.energy}</span>
            )}
            {person.messageCount > 0 && (
              <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-full">
                💬 {person.messageCount.toLocaleString()} msgs
              </span>
            )}
            {person.messagesPerDay > 0 && (
              <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-full">
                {person.messagesPerDay.toFixed(1)}/day
              </span>
            )}
          </div>
        )}

        {(person.flags?.green?.length > 0 || person.flags?.yellow?.length > 0 || person.flags?.red?.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['green', 'yellow', 'red'].map(color =>
              (person.flags?.[color] || []).map((flag, i) => (
                <FlagBadge key={`${color}-${i}`} color={color} text={flag} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function LizaSpotlight({ person }) {
  if (!person) return null;
  const days = person.dateStarted ? daysBetween(person.dateStarted, todayISO()) : 0;

  return (
    <div className="mx-4 mt-4 bg-gradient-to-r from-pink-950 to-purple-950 rounded-xl p-4 border border-pink-800">
      <div className="flex items-center gap-4">
        <Avatar person={person} size="lg" />
        <div>
          <h3 className="text-lg font-bold text-white">{person.name}</h3>
          <p className="text-pink-300 text-sm">Day {days} together</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div className="bg-black bg-opacity-30 rounded-lg py-2">
          <div className="text-lg font-bold text-white">{days}</div>
          <div className="text-xs text-neutral-400">Days</div>
        </div>
        <div className="bg-black bg-opacity-30 rounded-lg py-2">
          <div className="text-lg font-bold text-white">{person.messageCount?.toLocaleString() || '—'}</div>
          <div className="text-xs text-neutral-400">Messages</div>
        </div>
        <div className="bg-black bg-opacity-30 rounded-lg py-2">
          <div className="text-lg font-bold text-white">{person.messagesPerDay?.toFixed(1) || '—'}</div>
          <div className="text-xs text-neutral-400">Msgs/Day</div>
        </div>
      </div>
      {person.flags?.green?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {person.flags.green.map((flag, i) => (
            <FlagBadge key={i} color="green" text={flag} />
          ))}
        </div>
      )}
    </div>
  );
}
