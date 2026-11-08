'use client';
import { useMemo, useState } from 'react';

type Result = { title?: string; name?: string; downloads?: number | string | null; downloadCount?: number | string; type?: string; keywords?: string[]; url?: string; [key: string]: unknown };
export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('Ready to research. Search results use demo data until an Apify actor is connected.');
  const [tab, setTab] = useState('Overview');
  const [actorInput, setActorInput] = useState('{\n  "searchQuery": "{{query}}"\n}');
  const [showSettings, setShowSettings] = useState(false);
  const [demo, setDemo] = useState(true);

  const downloads = useMemo(() => results.reduce((sum, item) => sum + (Number(item.downloads ?? item.downloadCount) || 0), 0), [results]);
  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true); setNotice('Analyzing search…');
    try {
      let parsed: Record<string, unknown> = {};
      try { parsed = JSON.parse(actorInput); } catch { throw new Error('Actor input must be valid JSON.'); }
      delete parsed.searchQuery;
      const res = await fetch('/api/analyze', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ query: query.trim(), actorInput: parsed }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResults(data.items || []); setDemo(Boolean(data.demo));
      setNotice(data.demo ? data.message : `Analysis complete · ${(data.items || []).length} records returned by your Apify actor.`);
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Something went wrong.'); }
    finally { setBusy(false); }
  }
  function exportCsv() {
    const rows = [['Title','Type','Downloads','Keywords'], ...results.map(r => [r.title || r.name || '', r.type || '', r.downloads ?? r.downloadCount ?? '', Array.isArray(r.keywords) ? r.keywords.join('|') : ''])];
    const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'stock-research.csv'; a.click(); URL.revokeObjectURL(a.href);
  }
  const nav = ['Overview','Keyword Research','Contributor Tracker','Saved Research'];
  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brandIcon">SA</div><div><b>STOCK MARKET</b><span>ANALYZER</span></div></div>
      <div className="workspace"><small>WORKSPACE</small><strong>Personal Research</strong><span className="status"><i/> Private workspace</span></div>
      <small className="navLabel">ANALYTICS</small>
      {nav.map(n => <button key={n} onClick={() => setTab(n)} className={`navItem ${tab===n?'active':''}`}><span className="navDot">{n==='Overview'?'◫':n==='Keyword Research'?'⌕':n==='Contributor Tracker'?'♙':'▣'}</span>{n}</button>)}
      <div className="sidebarBottom"><div className="plan"> <span>✦</span><div><b>Personal Edition</b><small>Connect Apify to go live</small></div></div><button className="settingsLink" onClick={() => setShowSettings(!showSettings)}>⚙ Settings & API</button></div>
    </aside>
    <section className="main">
      <header className="topbar"><div><span className="crumb">Workspace</span><span className="slash">/</span><b>{tab}</b></div><div className="topRight"><span className="liveBadge"><i/> {demo?'DEMO MODE':'LIVE DATA'}</span><div className="avatar">SA</div></div></header>
      <div className="content">
        <div className="pageHeading"><div><div className="eyebrow">ADOBE STOCK INTELLIGENCE</div><h1>{tab === 'Overview' ? 'Research dashboard' : tab}</h1><p>Discover market signals, evaluate creative niches, and organize your stock research.</p></div><button className="outlineBtn" onClick={() => setShowSettings(!showSettings)}>⚙ Configure API</button></div>
        {showSettings && <section className="settings card"><div className="sectionTitle"><div><h2>Apify connection</h2><p>API credentials stay on your server, never in the browser.</p></div><span className="tag">SERVER CONFIG</span></div><div className="notice">Add <b>APIFY_TOKEN</b> and <b>APIFY_ACTOR_ID</b> to your hosting provider's environment variables. Then redeploy. Never paste your secret token into this page.</div><label>Actor input JSON <span>Optional fields passed to your actor (searchQuery is added automatically).</span></label><textarea value={actorInput} onChange={e=>setActorInput(e.target.value)} spellCheck={false}/><small className="muted">The default input matches the recommended Adobe Stock Metadata Actor. The app replaces <code>{{query}}</code> with your search phrase.</small></section>}
        <section className="searchPanel card"><div className="searchTitle"><div><h2>Market research</h2><p>Search a keyword, niche, or creative concept.</p></div><span className="searchIcon">⌕</span></div><form onSubmit={analyze} className="searchForm"><div className="inputWrap"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try: healthcare icons, business background, 3D technology…"/></div><button className="primaryBtn" disabled={busy}>{busy?'Analyzing…':'Analyze market  →'}</button></form><div className="searchHints"><span>POPULAR RESEARCH:</span>{['healthcare icons','minimal business','AI technology','abstract background'].map(x=><button key={x} onClick={()=>setQuery(x)}>{x}</button>)}</div></section>
        <div className="sectionTitle metricsTitle"><div><h2>Market snapshot</h2><p>Summary of the current research results</p></div><button className="textBtn" onClick={exportCsv} disabled={!results.length}>↓ Export CSV</button></div>
        <div className="metrics"><Metric label="RESULTS FOUND" value={String(results.length)} note="Records returned" icon="▤"/><Metric label="DOWNLOADS IDENTIFIED" value={downloads ? downloads.toLocaleString() : '—'} note="Only if actor supplies counts" icon="⇩"/><Metric label="KEYWORDS FOUND" value={String(new Set(results.flatMap(r=>Array.isArray(r.keywords)?r.keywords:[])).size)} note="Unique returned keywords" icon="#"/><Metric label="DATA STATUS" value={demo?'DEMO':'LIVE'} note={demo?'Connect an Apify actor':'Actor response received'} icon="◉"/></div>
        <section className="card resultsCard"><div className="sectionTitle"><div><h2>Research results</h2><p>{notice}</p></div><span className="tag">{results.length} ITEMS</span></div>
          {results.length ? <div className="tableWrap"><table><thead><tr><th>ASSET / TITLE</th><th>TYPE</th><th>DOWNLOADS</th><th>KEYWORDS</th></tr></thead><tbody>{results.map((r,i)=><tr key={i}><td><b>{String(r.title || r.name || 'Untitled asset')}</b>{r.url && typeof r.url==='string' ? <a href={r.url} target="_blank" rel="noreferrer">Open source ↗</a>:null}</td><td><span className="typePill">{String(r.type || 'Asset')}</span></td><td>{r.downloads ?? r.downloadCount ?? 'Not provided'}</td><td>{Array.isArray(r.keywords)?r.keywords.slice(0,5).join(', '):'—'}</td></tr>)}</tbody></table></div> : <div className="empty"><div className="emptyIcon">⌕</div><b>No research yet</b><span>Enter a keyword above and select Analyze market to begin.</span></div>}
        </section>
        <div className="disclaimer">ⓘ <b>Data transparency:</b> Download counts, revenue, rankings, and opportunity scores are shown only when the connected data source provides enough evidence. This app does not invent Adobe Stock sales data. Follow Adobe Stock and Apify terms when collecting data.</div>
        <footer>STOCK MARKET ANALYZER <span>PERSONAL RESEARCH WORKSPACE · 2026</span></footer>
      </div>
    </section>
  </main>;
}
function Metric({label,value,note,icon}:{label:string,value:string,note:string,icon:string}) {
  return <div className="metric card"><div className="metricTop"><span>{label}</span><i>{icon}</i></div><strong>{value}</strong><small>{note}</small></div>;
}
