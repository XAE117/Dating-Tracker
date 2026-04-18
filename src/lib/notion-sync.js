const API_BASE = '/api/notion';

function toNotion(person) {
  const props = {
    Name: { title: [{ text: { content: person.name || '' } }] },
    Platform: person.platform ? { select: { name: person.platform } } : { select: null },
    'Date Started': person.dateStarted ? { date: { start: person.dateStarted } } : { date: null },
    'Date Ended': person.dateEnded ? { date: { start: person.dateEnded } } : { date: null },
    Status: { select: { name: person.status === 'active' ? 'Active' : person.status === 'paused' ? 'Paused' : 'Ended' } },
    'Interest Rating': { number: person.interestRating || null },
    'Future Likelihood': { number: person.futureLikelihood || null },
    'Met In Person': { checkbox: person.metInPerson === true },
    'Number of Dates': { number: person.numberOfDates || null },
    Sex: { checkbox: person.sex === true },
    'Sex Good': { checkbox: person.sexGood === true },
    'Physical Chemistry': { checkbox: person.physicalChemistry === true },
    'Emotional Connection': { checkbox: person.emotionalConnection === true },
    'Ended By': person.endedBy ? { select: { name: capitalize(person.endedBy) } } : { select: null },
    'Why Ended': person.whyEnded ? { select: { name: mapWhyEnded(person.whyEnded) } } : { select: null },
    'Saw Issues Early': { checkbox: person.sawIssuesEarly === true },
    'Would Swipe Again': { checkbox: person.wouldSwipeAgain === true },
    'Green Flags': { multi_select: (person.flags?.green || []).map(f => ({ name: f })) },
    'Yellow Flags': { multi_select: (person.flags?.yellow || []).map(f => ({ name: f })) },
    'Red Flags': { multi_select: (person.flags?.red || []).map(f => ({ name: f })) },
    'What Drew You': { rich_text: [{ text: { content: person.whatDrewYou || '' } }] },
    'What Learned': { rich_text: [{ text: { content: person.whatLearned || '' } }] },
    Notes: { rich_text: [{ text: { content: person.notes || '' } }] },
    'Photo URL': person.photoUrl ? { url: person.photoUrl } : { url: null },
  };
  return props;
}

function fromNotion(page) {
  const p = page.properties;
  const getText = (prop) => prop?.rich_text?.[0]?.plain_text || '';
  const getTitle = (prop) => prop?.title?.[0]?.plain_text || '';
  const getSelect = (prop) => prop?.select?.name || '';
  const getMulti = (prop) => (prop?.multi_select || []).map(o => o.name);

  return {
    id: page.id,
    notionId: page.id,
    name: getTitle(p.Name),
    platform: getSelect(p.Platform),
    dateStarted: p['Date Started']?.date?.start || '',
    dateEnded: p['Date Ended']?.date?.start || '',
    status: (getSelect(p.Status) || 'Active').toLowerCase(),
    interestRating: p['Interest Rating']?.number || 3,
    futureLikelihood: p['Future Likelihood']?.number || 5,
    metInPerson: p['Met In Person']?.checkbox || false,
    numberOfDates: p['Number of Dates']?.number || 0,
    sex: p.Sex?.checkbox || false,
    sexGood: p['Sex Good']?.checkbox || false,
    physicalChemistry: p['Physical Chemistry']?.checkbox || false,
    emotionalConnection: p['Emotional Connection']?.checkbox || false,
    endedBy: (getSelect(p['Ended By']) || '').toLowerCase(),
    whyEnded: reverseMapWhyEnded(getSelect(p['Why Ended'])),
    sawIssuesEarly: p['Saw Issues Early']?.checkbox || false,
    wouldSwipeAgain: p['Would Swipe Again']?.checkbox || false,
    flags: {
      green: getMulti(p['Green Flags']),
      yellow: getMulti(p['Yellow Flags']),
      red: getMulti(p['Red Flags']),
    },
    whatDrewYou: getText(p['What Drew You']),
    whatLearned: getText(p['What Learned']),
    notes: getText(p.Notes),
    photoUrl: p['Photo URL']?.url || '',
    lastEdited: page.last_edited_time,
    // Enrichment fields (read-only from Notion)
    daysTogether: p['Days Together']?.number || null,
    energy: getSelect(p.Energy) || null,
    messageCount: p['Message Count']?.number || null,
    messagesPerDay: p['Messages Per Day']?.number || null,
  };
}

/**
 * Merge remote entries with local cache, keeping newer version per entry.
 * Local-only entries (no notionId) are always preserved.
 */
export function mergeEntries(local, remote) {
  const result = [];
  const remoteMap = new Map(remote.map(r => [r.notionId, r]));
  const seen = new Set();

  // Walk local entries
  for (const loc of local) {
    if (!loc.notionId) {
      // Local-only entry, keep it
      result.push(loc);
      continue;
    }
    seen.add(loc.notionId);
    const rem = remoteMap.get(loc.notionId);
    if (!rem) {
      // Deleted remotely, drop it
      continue;
    }
    // Compare timestamps — keep whichever is newer
    const localTime = loc.lastEdited ? new Date(loc.lastEdited).getTime() : 0;
    const remoteTime = rem.lastEdited ? new Date(rem.lastEdited).getTime() : 0;
    result.push(remoteTime >= localTime ? rem : loc);
  }

  // Add remote entries not in local
  for (const rem of remote) {
    if (!seen.has(rem.notionId)) {
      result.push(rem);
    }
  }

  return result;
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function mapWhyEnded(val) {
  const map = { 'their-stuff': 'Their Stuff', 'my-stuff': 'My Stuff', mutual: 'Mutual', natural: 'Natural Fade' };
  return map[val] || capitalize(val);
}

function reverseMapWhyEnded(val) {
  if (!val) return '';
  const map = { 'Their Stuff': 'their-stuff', 'My Stuff': 'my-stuff', Mutual: 'mutual', 'Natural Fade': 'natural' };
  return map[val] || val.toLowerCase();
}

export { toNotion, fromNotion };

export async function fetchAll() {
  const res = await fetch(`${API_BASE}?action=query`);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  return data.results.map(fromNotion);
}

export async function createEntry(person) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', properties: toNotion(person) }),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  const data = await res.json();
  return fromNotion(data);
}

export async function updateEntry(notionId, person) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', pageId: notionId, properties: toNotion(person) }),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  const data = await res.json();
  return fromNotion(data);
}

export async function deleteEntry(notionId) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'archive', pageId: notionId }),
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}
