const NOTION_KEY = process.env.NOTION_API_KEY;
const DB_ID = process.env.DATING_TRACKER_DB_ID;
const NOTION_VERSION = '2022-06-28';

if (!NOTION_KEY) throw new Error('NOTION_API_KEY env var is required');
if (!DB_ID) throw new Error('DATING_TRACKER_DB_ID env var is required');

const VALID_ACTIONS = ['create', 'update', 'archive', 'query'];
const UUID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
const MAX_BODY = 50 * 1024; // 50KB

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

async function queryAll() {
  const results = [];
  let hasMore = true;
  let cursor = undefined;
  while (hasMore) {
    const body = { sorts: [{ property: 'Date Started', direction: 'descending' }] };
    if (cursor) body.start_cursor = cursor;
    const data = await notionFetch(`/databases/${DB_ID}/query`, 'POST', body);
    results.push(...data.results);
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }
  return results;
}

export default async function handler(req, res) {
  // CORS
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://dating-tracker.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const results = await queryAll();
      return res.status(200).json({ results });
    }

    if (req.method === 'POST') {
      // Body size check
      const bodyStr = JSON.stringify(req.body || {});
      if (bodyStr.length > MAX_BODY) {
        return res.status(413).json({ error: 'Request body too large' });
      }

      const { action, properties, pageId } = req.body;

      // Validate action
      if (!action || !VALID_ACTIONS.includes(action)) {
        return res.status(400).json({ error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` });
      }

      // Validate pageId for update/archive
      if ((action === 'update' || action === 'archive') && (!pageId || !UUID_RE.test(pageId))) {
        return res.status(400).json({ error: 'Valid pageId required for update/archive' });
      }

      // Validate properties for create
      if (action === 'create' && (!properties || typeof properties !== 'object')) {
        return res.status(400).json({ error: 'Properties required for create' });
      }

      if (action === 'create') {
        const data = await notionFetch('/pages', 'POST', {
          parent: { database_id: DB_ID },
          properties,
        });
        return res.status(200).json(data);
      }

      if (action === 'update') {
        const data = await notionFetch(`/pages/${pageId}`, 'PATCH', { properties });
        return res.status(200).json(data);
      }

      if (action === 'archive') {
        const data = await notionFetch(`/pages/${pageId}`, 'PATCH', { archived: true });
        return res.status(200).json(data);
      }

      if (action === 'query') {
        const results = await queryAll();
        return res.status(200).json({ results });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
