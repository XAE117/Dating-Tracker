import { computeStats, computeTimeline } from '../lib/analytics';
import { formatDateDisplay, daysBetween, todayISO } from './shared';

export default function Analytics({ people }) {
  const stats = computeStats(people);
  const timeline = computeTimeline(people);

  return (
    <div className="p-4 space-y-6">
      {/* Summary Grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Active" value={stats.activeCount} color="text-blue-400" />
        <StatCard label="Ended" value={stats.endedCount} color="text-neutral-400" />
        <StatCard label="Met %" value={`${stats.metPct}%`} color="text-green-400" />
        <StatCard label="Avg Dates" value={stats.avgDates} />
        <StatCard label="Saw Early" value={`${stats.sawEarlyPct}%`} color="text-yellow-400" />
      </div>

      {/* Platform Breakdown */}
      <Section title="Platforms">
        {Object.entries(stats.platforms)
          .sort((a, b) => b[1] - a[1])
          .map(([plat, count]) => (
            <BarRow key={plat} label={plat} count={count} total={stats.total} color="bg-blue-600" />
          ))}
      </Section>

      {/* Ended By */}
      {Object.keys(stats.endedBy).length > 0 && (
        <Section title="Ended By">
          {Object.entries(stats.endedBy)
            .sort((a, b) => b[1] - a[1])
            .map(([by, count]) => (
              <BarRow key={by} label={capitalize(by)} count={count} total={stats.endedCount} color="bg-neutral-500" />
            ))}
        </Section>
      )}

      {/* Flag Analysis */}
      {['green', 'yellow', 'red'].map(color => {
        const flags = stats.topFlags[color];
        if (!flags.length) return null;
        const colorLabel = { green: '🟢 Green Flags', yellow: '🟡 Yellow Flags', red: '🔴 Red Flags' };
        const barColor = { green: 'bg-green-600', yellow: 'bg-yellow-600', red: 'bg-red-600' };
        const maxCount = flags[0]?.[1] || 1;
        return (
          <Section key={color} title={colorLabel[color]}>
            {flags.map(([flag, count]) => (
              <BarRow key={flag} label={flag} count={count} total={maxCount} color={barColor[color]} showCount />
            ))}
          </Section>
        );
      })}

      {/* Timeline */}
      {timeline.length > 0 && (
        <Section title="Timeline">
          <div className="space-y-2">
            {timeline.map(person => {
              const end = person.dateEnded || (person.status !== 'ended' ? todayISO() : person.dateStarted);
              const days = daysBetween(person.dateStarted, end);
              const maxDays = Math.max(...timeline.map(p => {
                const e = p.dateEnded || (p.status !== 'ended' ? todayISO() : p.dateStarted);
                return daysBetween(p.dateStarted, e);
              }), 1);
              const widthPct = Math.max(Math.round((days / maxDays) * 100), 5);
              const statusColor = person.status === 'active' ? 'bg-blue-600' :
                person.status === 'paused' ? 'bg-yellow-600' : 'bg-neutral-600';
              return (
                <div key={person.id} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 w-24 shrink-0 truncate">{person.name}</span>
                  <div className="flex-1">
                    <div className={`${statusColor} rounded-full h-4`} style={{ width: `${widthPct}%` }} />
                  </div>
                  <span className="text-xs text-neutral-500 w-10 text-right">{days}d</span>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

function StatCard({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800 text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
      <h3 className="text-sm font-semibold text-neutral-400 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function BarRow({ label, count, total, color, showCount = false }) {
  const pct = Math.max(Math.round((count / total) * 100), 3);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-300 w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-neutral-800 rounded-full h-5 overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-neutral-500 w-8 text-right">{showCount ? count : `${count}`}</span>
    </div>
  );
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
