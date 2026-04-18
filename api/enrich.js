const NOTION_KEY = process.env.NOTION_API_KEY;
const CRM_DB_ID = process.env.CONTACT_CRM_DB_ID || '7993e9e9-7df6-4c31-b4e4-c38ed3925271';
const NOTION_VERSION = '2022-06-28';

async function notionFetch(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.notion.com/v1${endpoint}`, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion ${res.status}: ${err}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Query all CRM contacts
    const results = [];
    let hasMore = true;
    let cursor = undefined;
    while (hasMore) {
      const body = {};
      if (cursor) body.start_cursor = cursor;
      const data = await notionFetch(`/databases/${CRM_DB_ID}/query`, 'POST', body);
      results.push(...data.results);
      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    // Build name → enrichment map
    const contacts = {};
    for (const page of results) {
      const name = page.properties.Name?.title?.[0]?.plain_text || '';
      if (!name) continue;
      contacts[name.toLowerCase()] = {
        energy: page.properties.Energy?.select?.name || null,
        lastContacted: page.properties['Last Contact']?.date?.start || null,
        cadenceDays: page.properties['Cadence (Days)']?.number || null,
      };
    }

    return res.status(200).json({ contacts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
