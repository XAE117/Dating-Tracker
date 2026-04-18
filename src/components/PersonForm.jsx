import { useRef } from 'react';
import { StarRating, YesNo, FlagBadge, getInitials } from './shared';

const LIKELIHOOD_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 111];

function compressPhoto(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 200;
        let w = img.width, h = img.height;
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function PersonForm({ person, onChange, onSave, onCancel, saving }) {
  const update = (fields) => onChange({ ...person, ...fields });
  const fileInputRef = useRef(null);

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

  const handlePhotoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressPhoto(file);
    update({ photoUrl: compressed });
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
          {/* Photo picker */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Photo</label>
            <div className="flex items-center gap-4">
              {person.photoUrl ? (
                <img src={person.photoUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-neutral-700" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-300 text-lg font-medium border-2 border-neutral-600">
                  {getInitials(person.name || '?')}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm">
                  {person.photoUrl ? 'Change photo' : 'Add photo'}
                </button>
                {person.photoUrl && (
                  <button type="button"
                    onClick={() => update({ photoUrl: '' })}
                    className="px-4 py-2 bg-neutral-800 text-red-400 rounded-lg text-sm">
                    Remove
                  </button>
                )}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="user"
              onChange={handlePhotoFile} className="hidden" />
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

          {/* Interest */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Interest ({person.interestRating}/5)</label>
            <StarRating value={person.interestRating} onChange={v => update({ interestRating: v })} />
          </div>

          {/* Future likelihood — 0-111% select */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Future likelihood — <span className="text-white font-semibold">{person.futureLikelihood}%</span>
            </label>
            <select value={person.futureLikelihood}
              onChange={e => update({ futureLikelihood: parseInt(e.target.value) })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-base text-white">
              {LIKELIHOOD_OPTIONS.map(v => (
                <option key={v} value={v}>{v}%</option>
              ))}
            </select>
            {/* Visual bar */}
            <div className="mt-2 h-2 bg-neutral-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.min(person.futureLikelihood, 100)}%` }} />
            </div>
          </div>

          {/* Met / Dates */}
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

          {/* Sex / Sex quality */}
          <div>
            <YesNo label="Sex?" value={person.sex}
              onChange={v => update({ sex: v, sexGood: v ? person.sexGood || 0 : 0 })} />
            {person.sex && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Sex quality {person.sexGood > 0 ? `(${person.sexGood}/5)` : '(not rated)'}
                </label>
                <StarRating value={person.sexGood} onChange={v => update({ sexGood: v })} allowZero />
              </div>
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
