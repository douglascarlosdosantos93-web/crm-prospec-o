export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, action, dbId, body, pageId, status } = req.body;

  if (!token) return res.status(401).json({ error: 'Token ausente' });

  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };

  try {
    if (action === 'query') {
      const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const data = await r.json();
      if (r.status === 401) return res.status(401).json(data);
      if (r.status === 403) return res.status(403).json(data);
      return res.status(r.status).json(data);
    }

    if (action === 'update') {
      const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ properties: { Status: { select: { name: status } } } })
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    return res.status(400).json({ error: 'Ação inválida' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
