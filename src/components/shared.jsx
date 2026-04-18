export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function daysBetween(a, b) {
  const d1 = new Date(a + 'T12:00:00');
  const d2 = new Date(b + 'T12:00:00');
  return Math.round((d2 - d1) / 86400000);
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function Avatar({ person, size = 'md' }) {
  const sizeClasses = { sm: 'w-10 h-10 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-lg' };
  if (person.photoUrl) {
    return <img src={person.photoUrl} alt={person.name} className={`${sizeClasses[size]} rounded-full object-cover border-2 border-neutral-700`} />;
  }
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-neutral-700 flex items-center justify-center text-neutral-300 font-medium border-2 border-neutral-600`}>
      {getInitials(person.name || '?')}
    </div>
  );
}

export function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange?.(i)}
          className={`text-3xl ${i <= value ? 'text-yellow-400' : 'text-neutral-600'}`}>★</button>
      ))}
    </div>
  );
}

export function StarDisplay({ value }) {
  return <span className="text-yellow-400">{'★' + value}</span>;
}

export function YesNo({ value, onChange, label }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-400 mb-2">{label}</label>
      <div className="flex gap-2">
        <button type="button" onClick={() => onChange(true)}
          className={`flex-1 py-3 rounded-lg border text-base font-medium ${value === true ? 'bg-green-600 text-white border-green-600' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>Yes</button>
        <button type="button" onClick={() => onChange(false)}
          className={`flex-1 py-3 rounded-lg border text-base font-medium ${value === false ? 'bg-red-600 text-white border-red-600' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>No</button>
      </div>
    </div>
  );
}

export function FlagBadge({ color, text, onRemove }) {
  const colors = {
    green: 'bg-green-900 text-green-300 border-green-700',
    yellow: 'bg-yellow-900 text-yellow-300 border-yellow-700',
    red: 'bg-red-900 text-red-300 border-red-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border ${colors[color]}`}>
      {text}
      {onRemove && <button type="button" onClick={onRemove} className="ml-1 text-lg leading-none opacity-70">&times;</button>}
    </span>
  );
}

export function SyncStatus({ status, count }) {
  const statusStyles = {
    synced: 'text-green-400',
    syncing: 'text-blue-400 animate-pulse',
    offline: 'text-yellow-400',
    error: 'text-red-400',
  };
  const labels = {
    synced: 'Synced',
    syncing: 'Syncing...',
    offline: 'Offline',
    error: 'Sync error',
  };
  return (
    <div className={`text-xs ${statusStyles[status]}`}>
      {labels[status]} {status === 'synced' && `· ${count} entries`}
    </div>
  );
}
