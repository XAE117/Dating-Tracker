export function computeStats(people) {
  const total = people.length;
  const active = people.filter(p => p.status === 'active' || p.status === 'paused');
  const ended = people.filter(p => p.status === 'ended');
  const met = people.filter(p => p.metInPerson);
  const sawEarly = ended.filter(p => p.sawIssuesEarly);

  const totalDates = people.reduce((sum, p) => sum + (p.numberOfDates || 0), 0);
  const pplWithDates = people.filter(p => p.numberOfDates > 0);
  const avgDates = pplWithDates.length ? (totalDates / pplWithDates.length) : 0;

  // Platform breakdown
  const platforms = {};
  for (const p of people) {
    const plat = p.platform || 'Unknown';
    platforms[plat] = (platforms[plat] || 0) + 1;
  }

  // Ended by breakdown
  const endedBy = {};
  for (const p of ended) {
    const by = p.endedBy || 'unknown';
    endedBy[by] = (endedBy[by] || 0) + 1;
  }

  // Flag analysis — top flags per color
  const flagCounts = { green: {}, yellow: {}, red: {} };
  for (const p of people) {
    for (const color of ['green', 'yellow', 'red']) {
      for (const flag of (p.flags?.[color] || [])) {
        flagCounts[color][flag] = (flagCounts[color][flag] || 0) + 1;
      }
    }
  }
  const topFlags = {};
  for (const color of ['green', 'yellow', 'red']) {
    topFlags[color] = Object.entries(flagCounts[color])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  return {
    total,
    activeCount: active.length,
    endedCount: ended.length,
    metCount: met.length,
    metPct: total ? Math.round(met.length / total * 100) : 0,
    avgDates: Math.round(avgDates * 10) / 10,
    sawEarlyPct: ended.length ? Math.round(sawEarly.length / ended.length * 100) : 0,
    platforms,
    endedBy,
    topFlags,
  };
}

export function computeTimeline(people) {
  return [...people]
    .filter(p => p.dateStarted)
    .sort((a, b) => a.dateStarted.localeCompare(b.dateStarted));
}
