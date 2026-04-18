import { StarRating, YesNo, FlagBadge } from './shared';

export default function PersonForm({ person, onChange, onSave, onCancel, saving }) {
  const update = (fields) => onChange({ ...person, ...fields });

  const addFlag = () => {
    if (!person.newFlag.text.trim()) return;
    const color = person.newFlag.color;
    onChange({
      ...person,
      flags: { ...person.flags, [color]: [...person.flags[color], person.newFlag.text] },
      newFlag: { color: 'green', text: '' },
    });
  };

  const removeFlag = (color, index) => {
    onChange({
      ...person,
      flags: { ...person.flags, [color]: person.flags[color].filter((_, i) => i !== index) },
    });
  };

  const isEditing = !!person.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-y-auto">
      <div className="min-h-full bg-neutral-900">
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex justify-between items-center z-10">
          <button onClick={onCancel} className="text-blue-400 text-base" disabled={saving}>Cancel</button>
          <h2 className="font-semibold text-lg text-white">{isEditing ? 'Edit' : 'Add'} Person</h2>
          <button onClick={onSave} disabled={saving}
            className={`font-semibold text-base ${saving ? 'text-neutral-500' : 'text-blue-400'}`}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="p-4 space-y-5 pb-12">
          {/* Photo URL */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Photo URL</label>
            <input type="url" value={person.photoUrl || ''}
              onChange={e => update({ photoUrl: e.target.value })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white"
              placeholder="https://..." />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Name</label>
            <input type="text" value={person.name}
              onChange={e => update({ name: e.target.value })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white" placeholder="Name" />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Platform</label>
            <select value={person.platform}
              onChange={e => update({ platform: e.target.value })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white">
              <option value="">—</option>
              <option value="Hinge">Hinge</option>
              <option value="Bumble">Bumble</option>
              <option value="R4R">R4R</option>
              <option value="IRL">IRL</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Started</label>
              <input type="date" value={person.dateStarted}
                onChange={e => update({ dateStarted: e.target.value })}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Ended</label>
              <input type="date" value={person.dateEnded}
                onChange={e => update({ dateEnded: e.target.value })}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Status</label>
            <div className="flex gap-2">
              {[
                { val: 'active', label: 'Active', active: 'bg-blue-600 text-white border-blue-600' },
                { val: 'paused', label: 'Paused', active: 'bg-yellow-600 text-white border-yellow-600' },
                { val: 'ended', label: 'Ended', active: 'bg-neutral-600 text-white border-neutral-600' },
              ].map(s => (
                <button key={s.val} type="button"
                  onClick={() => update({ status: s.val })}
                  className={`flex-1 py-3 rounded-xl border text-base font-medium ${person.status === s.val ? s.active : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Interest ({person.interestRating}/5)</label>
            <StarRating value={person.interestRating} onChange={v => update({ interestRating: v })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Future Likelihood ({person.futureLikelihood}/10)</label>
            <input type="range" min="1" max="10" value={person.futureLikelihood}
              onChange={e => update({ futureLikelihood: parseInt(e.target.value) })}
              className="w-full h-8" />
          </div>

          {/* Yes/No Questions */}
          <div className="grid grid-cols-2 gap-4">
            <YesNo label="Met in person?" value={person.metInPerson}
              onChange={v => update({ metInPerson: v })} />
            {person.metInPerson && (
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2"># of Dates</label>
                <input type="number" min="0" value={person.numberOfDates}
                  onChange={e => update({ numberOfDates: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <YesNo label="Sex?" value={person.sex}
              onChange={v => update({ sex: v, sexGood: v ? person.sexGood : false })} />
            {person.sex && (
              <YesNo label="Good?" value={person.sexGood}
                onChange={v => update({ sexGood: v })} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <YesNo label="Physical chemistry?" value={person.physicalChemistry}
              onChange={v => update({ physicalChemistry: v })} />
            <YesNo label="Emotional connection?" value={person.emotionalConnection}
              onChange={v => update({ emotionalConnection: v })} />
          </div>

          {/* Ending */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Ended by</label>
              <select value={person.endedBy}
                onChange={e => update({ endedBy: e.target.value })}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white">
                <option value="">—</option>
                <option value="me">Me</option>
                <option value="her">Her</option>
                <option value="mutual">Mutual</option>
                <option value="ghosted">Ghosted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Why</label>
              <select value={person.whyEnded}
                onChange={e => update({ whyEnded: e.target.value })}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white">
                <option value="">—</option>
                <option value="their-stuff">Their stuff</option>
                <option value="my-stuff">My stuff</option>
                <option value="mutual">Mutual</option>
                <option value="natural">Natural fade</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <YesNo label="Saw issues early?" value={person.sawIssuesEarly}
              onChange={v => update({ sawIssuesEarly: v })} />
            <YesNo label="Would swipe again?" value={person.wouldSwipeAgain}
              onChange={v => update({ wouldSwipeAgain: v })} />
          </div>

          {/* Flags */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Flags</label>
            <div className="flex gap-2 mb-3">
              <select value={person.newFlag.color}
                onChange={e => onChange({ ...person, newFlag: { ...person.newFlag, color: e.target.value } })}
                className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white">
                <option value="green">🟢</option>
                <option value="yellow">🟡</option>
                <option value="red">🔴</option>
              </select>
              <input type="text" value={person.newFlag.text}
                onChange={e => onChange({ ...person, newFlag: { ...person.newFlag, text: e.target.value } })}
                onKeyDown={e => e.key === 'Enter' && addFlag()}
                className="flex-1 p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white" placeholder="Add flag..." />
              <button type="button" onClick={addFlag} className="px-5 py-3 bg-neutral-700 rounded-xl text-xl text-white">+</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['green', 'yellow', 'red'].map(color =>
                (person.flags?.[color] || []).map((flag, i) => (
                  <FlagBadge key={`${color}-${i}`} color={color} text={flag} onRemove={() => removeFlag(color, i)} />
                ))
              )}
            </div>
          </div>

          {/* Text fields */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">What drew you?</label>
            <textarea value={person.whatDrewYou}
              onChange={e => update({ whatDrewYou: e.target.value })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white" rows="2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">What did you learn?</label>
            <textarea value={person.whatLearned}
              onChange={e => update({ whatLearned: e.target.value })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white" rows="2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Notes</label>
            <textarea value={person.notes}
              onChange={e => update({ notes: e.target.value })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white" rows="3" />
          </div>
        </div>
      </div>
    </div>
  );
}
