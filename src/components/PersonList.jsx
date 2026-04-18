import { Avatar, FlagBadge, formatDateDisplay, daysBetween, todayISO } from './shared';

export default function PersonList({ people, onEdit, onDelete, showEnrichment = false }) {
  if (people.length === 0) {
    return <div className="text-center text-neutral-500 py-12">No one here yet</div>;
  }

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

function statusBadge(status) {
  if (status === 'active') return { label: 'Active', cls: 'bg-blue-900 text-blue-300' };
  if (status === 'paused') return { label: 'Paused', cls: 'bg-yellow-900 text-yellow-300' };
  return null;
}

function likelihoodColor(pct) {
  if (pct >= 70) return 'bg-green-900 text-green-300';
  if (pct >= 35) return 'bg-yellow-900 text-yellow-300';
  return 'bg-neutral-800 text-neutral-400';
}

function PersonCard({ person, onEdit, onDelete, showEnrichment }) {
  const days = person.dateStarted && person.status !== 'ended'
    ? daysBetween(person.dateStarted, todayISO())
    : person.dateStarted && person.dateEnded
      ? daysBetween(person.dateStarted, person.dateEnded)
      : null;

  const badge = statusBadge(person.status);
  const hasLikelihood = person.futureLikelihood != null && person.futureLikelihood > 0;

  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 flex gap-3 relative"
      onClick={() => onEdit(person)}>

      {/* Avatar — fixed width */}
      <div className="flex-shrink-0">
        <Avatar person={person} />
      </div>

      {/* Main content — leaves room for right column */}
      <div className="flex-1 min-w-0 pr-14">
        {/* Name */}
        <h3 className="font-semibold text-white text-lg leading-tight">{person.name}</h3>

        {/* Fixed badge row: Met · Days · Likelihood */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1 mb-1.5 min-h-[22px]">
          {person.metInPerson && (
            <span className="px-2 py-0.5 bg-green-900 text-green-300 text-xs rounded-full font-medium">Met</span>
          )}
          {days !== null && (
            <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 text-xs rounded-full">{days}d</span>
          )}
          {hasLikelihood && (
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${likelihoodColor(person.futureLikelihood)}`}>
              {person.futureLikelihood}%
            </span>
          )}
        </div>

        {/* Date / platform line */}
        <p className="text-xs text-neutral-500">
          {person.platform && `${person.platform} · `}
          {formatDateDisplay(person.dateStarted)}
          {person.dateEnded && ` → ${formatDateDisplay(person.dateEnded)}`}
        </p>

        {/* Stats row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <span className="text-yellow-400">{'★' + person.interestRating}</span>
          {person.metInPerson && person.numberOfDates > 0 && (
            <span>{person.numberOfDates} date{person.numberOfDates !== 1 ? 's' : ''}</span>
          )}
          {person.endedBy && <span>Ended: {person.endedBy}</span>}
          {person.sex && person.sexGood > 0 && (
            <span className="text-yellow-400 text-xs">{'★'.repeat(person.sexGood)}</span>
          )}
        </div>

        {/* Enrichment badges */}
        {showEnrichment && (person.energy || person.messageCount) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            {person.energy && (
              <span className={`px-2 py-0.5 rounded-full ${
                person.energy === 'Energizing' ? 'bg-green-900 text-green-300' :
                person.energy === 'Draining' ? 'bg-red-900 text-red-300' :
                'bg-neutral-800 text-neutral-400'
              }`}>{person.energy === 'Energizing' ? '⚡' : person.energy === 'Draining' ? '🔻' : '➖'} {person.energy}</span>
            )}
            {person.messageCount > 0 && (
              <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-full">
                💬 {person.messageCount.toLocaleString()}
              </span>
            )}
            {person.messagesPerDay > 0 && (
              <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-full">
                {person.messagesPerDay.toFixed(1)}/day
              </span>
            )}
          </div>
        )}

        {/* Flags */}
        {(person.flags?.green?.length > 0 || person.flags?.yellow?.length > 0 || person.flags?.red?.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {['green', 'yellow', 'red'].map(color =>
              (person.flags?.[color] || []).map((flag, i) => (
                <FlagBadge key={`${color}-${i}`} color={color} text={flag} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Right column: status badge (top) + delete X (bottom) — absolute */}
      <div className="absolute right-3 top-3 bottom-3 flex flex-col justify-between items-end">
        {badge ? (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>{badge.label}</span>
        ) : (
          <span />
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(person); }}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-950 text-red-400 text-base font-bold leading-none"
          aria-label="Delete">
          ×
        </button>
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
