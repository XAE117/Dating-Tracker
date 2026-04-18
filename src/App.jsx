import { useState, useEffect, useCallback } from 'react';
import { loadFromCache, saveToCache, setSyncMeta } from './lib/local-storage';
import { SEED_DATA } from './lib/seed-data';
import { fetchAll, createEntry, updateEntry, deleteEntry, mergeEntries } from './lib/notion-sync';
import { showToast } from './lib/toast';
import { SyncStatus } from './components/shared';
import PersonList, { LizaSpotlight } from './components/PersonList';
import PersonForm from './components/PersonForm';
import Analytics from './components/Analytics';

const emptyPerson = {
  id: null,
  notionId: null,
  name: '',
  platform: '',
  dateStarted: '',
  dateEnded: '',
  interestRating: 3,
  futureLikelihood: 50,
  flags: { green: [], yellow: [], red: [] },
  newFlag: { color: 'green', text: '' },
  status: 'active',
  metInPerson: false,
  numberOfDates: 0,
  sex: false,
  sexGood: 0,
  physicalChemistry: false,
  emotionalConnection: false,
  endedBy: '',
  whyEnded: '',
  sawIssuesEarly: false,
  wouldSwipeAgain: false,
  whatDrewYou: '',
  whatLearned: '',
  notes: '',
  photoUrl: '',
};

export default function App() {
  const [people, setPeople] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [currentPerson, setCurrentPerson] = useState(emptyPerson);
  const [syncStatus, setSyncStatus] = useState('offline');
  const [saving, setSaving] = useState(false);

  // Load from cache on mount (seed if empty), then sync
  useEffect(() => {
    const cached = loadFromCache();
    if (cached.length) {
      setPeople(cached);
    } else {
      setPeople(SEED_DATA);
      saveToCache(SEED_DATA);
    }
    syncFromNotion();
  }, []);

  // Save to cache whenever people changes
  useEffect(() => {
    if (people.length) saveToCache(people);
  }, [people]);

  const syncFromNotion = useCallback(async () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    try {
      const remote = await fetchAll();
      setPeople(prev => {
        const merged = mergeEntries(prev, remote);
        saveToCache(merged);
        return merged;
      });
      setSyncMeta({ lastSync: new Date().toISOString() });
      setSyncStatus('synced');
      showToast('Synced with Notion', 'success');
    } catch (err) {
      setSyncStatus(people.length ? 'offline' : 'error');
      showToast(`Sync failed: ${err.message}`, 'error');
    }
  }, [syncStatus, people.length]);

  const validatePerson = (person) => {
    if (!person.name.trim()) return 'Name is required';
    if (person.dateEnded && person.dateStarted && person.dateEnded < person.dateStarted) {
      return 'End date must be after start date';
    }
    if (person.status === 'ended' && !person.endedBy) {
      return 'Select who ended it';
    }
    return null;
  };

  const savePerson = async () => {
    const error = validatePerson(currentPerson);
    if (error) {
      showToast(error, 'error');
      return;
    }

    setSaving(true);
    const personData = { ...currentPerson };
    delete personData.newFlag;

    try {
      if (editingId && currentPerson.notionId) {
        setPeople(prev => prev.map(p => p.id === editingId ? { ...personData, id: editingId } : p));
        setShowForm(false);
        setEditingId(null);
        setCurrentPerson(emptyPerson);
        await updateEntry(currentPerson.notionId, personData);
        showToast('Updated', 'success');
        syncFromNotion();
      } else if (editingId) {
        setPeople(prev => prev.map(p => p.id === editingId ? { ...personData, id: editingId } : p));
        setShowForm(false);
        setEditingId(null);
        setCurrentPerson(emptyPerson);
        showToast('Saved locally', 'info');
      } else {
        const tempId = Date.now();
        const newPerson = { ...personData, id: tempId };
        setPeople(prev => [...prev, newPerson]);
        setShowForm(false);
        setCurrentPerson(emptyPerson);
        try {
          const created = await createEntry(personData);
          setPeople(prev => prev.map(p => p.id === tempId ? { ...created, id: created.notionId } : p));
          showToast('Created', 'success');
        } catch (err) {
          showToast(`Saved locally, sync failed: ${err.message}`, 'error');
        }
      }
    } catch (err) {
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const editPerson = (person) => {
    setCurrentPerson({
      ...emptyPerson,
      ...person,
      newFlag: { color: 'green', text: '' },
    });
    setEditingId(person.id);
    setShowForm(true);
  };

  const deletePerson = async (person) => {
    if (!confirm('Delete this person?')) return;
    setPeople(prev => prev.filter(p => p.id !== person.id));
    if (person.notionId) {
      try {
        await deleteEntry(person.notionId);
        showToast('Deleted', 'success');
      } catch (err) {
        showToast(`Delete failed remotely: ${err.message}`, 'error');
      }
    } else {
      showToast('Deleted', 'success');
    }
  };

  // Filtering
  const filteredPeople = people.filter(p => {
    if (activeTab === 'active') return p.status === 'active' || p.status === 'paused';
    if (activeTab === 'ended') return p.status === 'ended';
    if (activeTab === 'stats') return false;
    return true;
  });

  const tabCounts = {
    active: people.filter(p => p.status === 'active' || p.status === 'paused').length,
    ended: people.filter(p => p.status === 'ended').length,
    all: people.length,
  };

  // Liza spotlight — find the active relationship entry named "Liza"
  const liza = activeTab === 'active'
    ? people.find(p => p.name.toLowerCase() === 'liza' && p.status === 'active')
    : null;

  return (
    <div className="min-h-screen bg-neutral-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-4 py-3 z-40">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Dating Tracker</h1>
          <div className="flex items-center gap-3">
            <SyncStatus status={syncStatus} count={people.length} />
            <button onClick={syncFromNotion}
              disabled={syncStatus === 'syncing'}
              className={`px-3 py-1.5 rounded-lg text-sm ${syncStatus === 'syncing' ? 'bg-neutral-700 text-neutral-500' : 'bg-neutral-800 text-neutral-300'}`}>
              Sync
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          {[
            { key: 'active', label: `Active (${tabCounts.active})` },
            { key: 'ended', label: `Ended (${tabCounts.ended})` },
            { key: 'all', label: `All (${tabCounts.all})` },
            { key: 'stats', label: 'Stats' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liza Spotlight */}
      {liza && <LizaSpotlight person={liza} />}

      {/* Content */}
      {activeTab === 'stats' ? (
        <Analytics people={people} />
      ) : (
        <div className="p-4">
          <PersonList people={filteredPeople} onEdit={editPerson} onDelete={deletePerson} showEnrichment />
        </div>
      )}

      {/* FAB */}
      {activeTab !== 'stats' && (
        <button onClick={() => { setShowForm(true); setCurrentPerson(emptyPerson); setEditingId(null); }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg text-3xl flex items-center justify-center z-40">+</button>
      )}

      {/* Form Modal */}
      {showForm && (
        <PersonForm
          person={currentPerson}
          onChange={setCurrentPerson}
          onSave={savePerson}
          onCancel={() => { setShowForm(false); setEditingId(null); setCurrentPerson(emptyPerson); }}
          saving={saving}
        />
      )}
    </div>
  );
}
