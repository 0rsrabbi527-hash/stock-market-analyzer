import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { query, actorInput = {} } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Enter a keyword or search phrase.' }, { status: 400 });
    }
    const token = process.env.APIFY_TOKEN;
    const actorId = process.env.APIFY_ACTOR_ID;
    if (!token || !actorId) {
      return NextResponse.json({
        demo: true,
        message: 'Demo results are shown. Add APIFY_TOKEN and APIFY_ACTOR_ID to enable live actor data.',
        items: [
          { title: `${query} vector illustration`, downloads: null, type: 'Vector', keywords: [query, 'illustration', 'design', 'template'] },
          { title: `Minimal ${query} icon set`, downloads: null, type: 'Illustration', keywords: [query, 'minimal', 'icon', 'outline'] },
          { title: `${query} concept background`, downloads: null, type: 'Image', keywords: [query, 'background', 'concept', 'creative'] }
        ]
      });
    }

    const replaceQuery = (value: unknown): unknown => {
      if (value === "{{query}}") return query;
      if (Array.isArray(value)) return value.map(replaceQuery);
      if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, replaceQuery(v)]));
      }
      return value;
    };
    const input = replaceQuery(actorInput) as Record<string, unknown>;
    const url = `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&clean=true&format=json`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      cache: 'no-store'
    });
    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: `Apify request failed (${response.status}).`, detail }, { status: 502 });
    }
    const items = await response.json();
    return NextResponse.json({ demo: false, items: Array.isArray(items) ? items : [] });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unexpected server error.' }, { status: 500 });
  }
}
