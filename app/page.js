'use client';

import { useEffect, useRef, useState } from 'react';
import { SITES, STOCK, SHIPMENTS, REQUESTS, HISTORY, T } from '../data/demoData';

const VAT = 0.05; // Oman VAT
const omr = (n) => 'OMR ' + n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const qty = (n, it) => `${n} ${n === 1 ? it.unit.replace(/s$/, '') : it.unit}`; // "1 kit", "4 kits"
const isLow = (i) => i.qty < i.min;
const now = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Page() {
  const [tab, setTab] = useState(0);
  const [lang, setLang] = useState('en');
  const [site, setSite] = useState(SITES[0]);
  const [stock, setStock] = useState(STOCK);
  const [shipments, setShipments] = useState(SHIPMENTS);
  const [requests, setRequests] = useState(REQUESTS);
  const [history, setHistory] = useState(HISTORY);
  const [inspecting, setInspecting] = useState(null); // shipment id
  const [dispatching, setDispatching] = useState(null); // request id
  const [msds, setMsds] = useState(null); // sku
  const [toast, setToast] = useState(null);
  const t = T[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const item = (sku) => stock.find((i) => i.sku === sku);
  const log = (text) => setHistory((h) => [{ time: 'Today ' + now(), text }, ...h]);
  const notify = (text, next) => setToast({ text, next, key: Date.now() });

  const toInspect = shipments.filter((s) => s.status === 'arrived');
  const waiting = requests.filter((r) => r.status === 'waiting');
  const low = stock.filter(isLow);

  // Step 1: QA/QC result. Passing releases the quantity to stock.
  function finishInspection(id, passed) {
    const s = shipments.find((x) => x.id === id);
    const it = item(s.sku);
    setShipments((list) => list.map((x) => (x.id === id ? { ...x, status: passed ? 'stored' : 'rejected' } : x)));
    if (passed) setStock((list) => list.map((i) => (i.sku === s.sku ? { ...i, qty: i.qty + s.qty } : i)));
    setInspecting(null);
    if (passed) {
      log(`${s.id} passed QA/QC and stored: ${qty(s.qty, it)} ${it.name} at ${it.location}`);
      notify(`${qty(s.qty, it)} of ${it.name} released to stock at ${it.location}.`, { label: 'See stock', tab: 2 });
    } else {
      log(`${s.id} failed QA/QC and returned to ${s.supplier}`);
      notify(`${s.id} rejected. Stock was not changed.`);
    }
  }

  // Step 3: dispatch to rig. Takes the quantity out of stock.
  function confirmDispatch(id, truck, driver) {
    const r = requests.find((x) => x.id === id);
    const it = item(r.sku);
    if (it.qty < r.qty) return; // never let stock go negative
    const gatePass = 'GP-' + String(490 + requests.filter((x) => x.gatePass).length).padStart(4, '0');
    setStock((list) => list.map((i) => (i.sku === r.sku ? { ...i, qty: i.qty - r.qty } : i)));
    setRequests((list) => list.map((x) => (x.id === id ? { ...x, status: 'dispatched', gatePass, truck, driver } : x)));
    log(`${r.id} dispatched to ${r.rig} with gate pass ${gatePass} (truck ${truck}): ${qty(r.qty, it)} ${it.name}`);
  }

  function raisePR(id) {
    const r = requests.find((x) => x.id === id);
    const it = item(r.sku);
    const pr = 'PR-' + (1043 + requests.filter((x) => x.pr).length);
    const need = r.qty - it.qty + it.min; // cover the request and refill to minimum
    setRequests((list) => list.map((x) => (x.id === id ? { ...x, pr } : x)));
    log(`${pr} raised to buy ${qty(need, it)} ${it.name} for ${r.id}`);
    notify(`Purchase request ${pr} sent to procurement for ${qty(need, it)} ${it.name}.`);
  }

  const tabs = [
    { label: t.tabs[0] },
    { label: t.tabs[1], count: toInspect.length },
    { label: t.tabs[2], count: low.length, warn: true },
    { label: t.tabs[3], count: waiting.length },
    { label: t.tabs[4] },
  ];

  return (
    <div className="min-h-screen md:flex">
      <aside className="no-print bg-slate-900 text-white flex flex-col md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <div className="p-5">
          <h1 className="font-semibold leading-snug">{t.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{t.prototype}</p>
        </div>

        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible">
          {tabs.map((x, i) => (
            <button key={i} onClick={() => setTab(i)} aria-current={tab === i ? 'page' : undefined}
              className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-start min-h-11 ${
                tab === i ? 'bg-blue-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              {x.label}
              {x.count > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${x.warn ? 'bg-amber-400 text-amber-950' : 'bg-white text-blue-800'}`}>
                  {x.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex flex-wrap items-end gap-2 border-t border-slate-800 p-4 md:grid">
          {/* shortcut: site switch only changes the label, all sites share one dataset; split data per site if the client wants it */}
          <label className="text-xs text-slate-400">{t.site}
            <select value={site} onChange={(e) => setSite(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-2 py-2 text-sm text-slate-100">
              {SITES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} lang={lang === 'en' ? 'ar' : 'en'}
            className="btn border border-slate-600 text-slate-100 hover:bg-slate-800">{t.lang}</button>
          <button onClick={() => location.reload()} className="btn border border-slate-600 text-slate-100 hover:bg-slate-800">{t.reset}</button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 no-print">
        {tab === 0 && (
          <section>
            <Intro title={t.howTitle}>{t.howText}</Intro>
            <ol className="grid gap-4 md:grid-cols-3">
              <FlowCard n="1" title={t.receive} text={t.receiveCard} go={() => setTab(1)}
                status={toInspect.length ? `${toInspect.length} shipments waiting for QA/QC` : 'Nothing waiting'} />
              <FlowCard n="2" title={t.stock} text={t.stockCard} go={() => setTab(2)}
                status={low.length ? `${low.length} items below minimum level` : 'All items above minimum'} warn={low.length > 0} />
              <FlowCard n="3" title={t.dispatch} text={t.dispatchCard} go={() => setTab(3)}
                status={waiting.length ? `${waiting.length} rig requests waiting` : 'Nothing waiting'} />
            </ol>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat label={t.stockValue} value={omr(stock.reduce((sum, i) => sum + i.qty * i.price, 0))} />
              <Stat label={t.items} value={stock.length} />
              <Stat label={t.dispatchedCount} value={requests.length - waiting.length} />
            </div>

            <h3 className="mt-10 mb-3 text-lg font-semibold">{t.attention}</h3>
            <ul className="card divide-y divide-slate-200">
              {waiting.filter((r) => r.urgent).map((r) => (
                <Attention key={r.id} tone="red" tag="Urgent" text={`${r.rig} needs ${qty(r.qty, item(r.sku))} ${item(r.sku).name}`} action="Dispatch" go={() => setTab(3)} />
              ))}
              {low.map((i) => (
                <Attention key={i.sku} tone="amber" tag="Low stock" text={`${i.name}: ${qty(i.qty, i)} left (minimum ${i.min})`} action="View" go={() => setTab(2)} />
              ))}
              {!low.length && !waiting.some((r) => r.urgent) && <li className="p-4 text-slate-600">Nothing needs attention.</li>}
            </ul>
          </section>
        )}

        {tab === 1 && (
          <section>
            <Intro title={t.receiveTitle}>{t.receiveText}</Intro>
            <h3 className="mb-3 font-semibold">{t.waitingQA}</h3>
            {toInspect.length === 0 && <Empty>All shipments are done. Next, check <Link onClick={() => setTab(2)}>Stock</Link>.</Empty>}
            <ul className="grid gap-3">
              {toInspect.map((s) => {
                const it = item(s.sku);
                return (
                  <li key={s.id} className="card p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {qty(s.qty, it)} · {it.name} <Badge tone="amber">QA/QC pending</Badge>
                        {it.hazmat && <MsdsBadge item={it} onOpen={setMsds} />}
                      </p>
                      <p className="text-sm text-slate-600">{s.id} · from {s.supplier} · goes to {it.location}</p>
                      {s.bayan && <p className="text-sm text-slate-600">Bayan customs # <span className="font-medium text-slate-800">{s.bayan}</span></p>}
                    </div>
                    <button className="btn btn-primary" onClick={() => setInspecting(s.id)}>{t.inspect}</button>
                  </li>
                );
              })}
            </ul>
            <Done title={t.finished} rows={shipments.filter((s) => s.status !== 'arrived').map((s) => ({
              key: s.id,
              text: `${s.id} · ${qty(s.qty, item(s.sku))} ${item(s.sku).name}`,
              badge: s.status === 'stored' ? <Badge tone="green">QA/QC passed · stored</Badge> : <Badge tone="red">Rejected</Badge>,
            }))} />
          </section>
        )}

        {tab === 2 && <StockTab stock={stock} t={t} onMsds={setMsds} />}

        {tab === 3 && (
          <section>
            <Intro title={t.dispatchTitle}>{t.dispatchText}</Intro>
            <h3 className="mb-3 font-semibold">{t.waitingReq}</h3>
            {waiting.length === 0 && <Empty>All requests are dispatched. See the <Link onClick={() => setTab(4)}>History</Link>.</Empty>}
            <ul className="grid gap-3">
              {waiting.map((r) => {
                const it = item(r.sku);
                const enough = it.qty >= r.qty;
                return (
                  <li key={r.id} className={`card border-s-4 p-4 flex flex-wrap items-center justify-between gap-4 ${r.urgent ? 'border-s-red-600' : 'border-s-blue-600'}`}>
                    <div>
                      <p className="font-semibold">{r.rig} {r.urgent ? <Badge tone="red">Urgent</Badge> : <Badge tone="blue">Routine</Badge>}</p>
                      <p className="text-slate-800">{qty(r.qty, it)} · {it.name} · <span className="font-medium">{omr(r.qty * it.price)}</span></p>
                      <p className={`text-sm ${enough ? 'text-slate-600' : 'text-red-700 font-medium'}`}>
                        {r.id} · {it.sku} · {enough ? `In stock: ${qty(it.qty, it)} at ${it.location}` : `Not enough stock: only ${qty(it.qty, it)} available.`}
                      </p>
                    </div>
                    {enough ? (
                      <button className="btn btn-primary" onClick={() => setDispatching(r.id)}>{t.approve}</button>
                    ) : r.pr ? (
                      <Badge tone="amber">{r.pr} raised · waiting for supplier</Badge>
                    ) : (
                      <button className="btn bg-amber-500 text-amber-950 hover:bg-amber-400" onClick={() => raisePR(r.id)}>{t.reorder}</button>
                    )}
                  </li>
                );
              })}
            </ul>
            <Done title={t.dispatched} rows={requests.filter((r) => r.status === 'dispatched').map((r) => ({
              key: r.id,
              text: `${r.id} · ${r.rig} · ${qty(r.qty, item(r.sku))} ${item(r.sku).name}`,
              badge: <button className="text-sm font-medium text-blue-700 underline" onClick={() => setDispatching(r.id)}>Gate pass {r.gatePass}</button>,
            }))} />
          </section>
        )}

        {tab === 4 && (
          <section>
            <Intro title={t.historyTitle}>{t.historyText}</Intro>
            <ol className="card divide-y divide-slate-200">
              {history.map((h, i) => (
                <li key={i} className="p-4 flex gap-4">
                  <span className="w-28 shrink-0 text-sm text-slate-500">{h.time}</span>
                  <span dir="ltr">{h.text}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
      </div>

      {inspecting && (
        <InspectDialog shipment={shipments.find((s) => s.id === inspecting)} item={item(shipments.find((s) => s.id === inspecting).sku)}
          onClose={() => setInspecting(null)} onResult={(passed) => finishInspection(inspecting, passed)} />
      )}

      {dispatching && (
        <GatePassDialog request={requests.find((r) => r.id === dispatching)} item={item(requests.find((r) => r.id === dispatching).sku)} site={site}
          onClose={() => setDispatching(null)} onConfirm={(truck, driver) => confirmDispatch(dispatching, truck, driver)} />
      )}

      {msds && <MsdsDialog item={item(msds)} onClose={() => setMsds(null)} />}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} go={(i) => { setTab(i); setToast(null); }} />}
    </div>
  );
}

function StockTab({ stock, t, onMsds }) {
  const [q, setQ] = useState('');
  const rows = stock.filter((i) => (i.name + i.sku + i.category).toLowerCase().includes(q.toLowerCase()));
  return (
    <section>
      <Intro title={t.stockTitle}>{t.stockText}</Intro>
      <label className="block mb-4 max-w-sm">
        <span className="text-sm font-medium">{t.search}</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. valve, pipe, CHM"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white" />
      </label>
      <div className="card overflow-x-auto">
        <table className="w-full text-start">
          <thead className="bg-slate-100 text-sm text-slate-700">
            <tr>
              <th className="p-3 text-start">{t.cols[0]}</th><th className="p-3 text-start">{t.cols[1]}</th>
              <th className="p-3 text-end">{t.cols[2]}</th><th className="p-3 text-end">{t.cols[3]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((i) => (
              <tr key={i.sku}>
                <td className="p-3">
                  <p className="font-medium">{i.name} {i.hazmat && <MsdsBadge item={i} onOpen={onMsds} />}</p>
                  <p className="text-sm text-slate-500">{i.sku} · {i.category}</p>
                </td>
                <td className="p-3 text-sm">{i.location}</td>
                <td className="p-3 text-end whitespace-nowrap">
                  <span className="font-semibold">{qty(i.qty, i)}</span>
                  {isLow(i) && <p><Badge tone="amber">Below minimum ({i.min})</Badge></p>}
                </td>
                <td className="p-3 text-end text-sm whitespace-nowrap">{omr(i.qty * i.price)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={4} className="p-4 text-slate-600">No items match “{q}”.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InspectDialog({ shipment: s, item: it, onClose, onResult }) {
  const checks = [
    `Quantity matches the delivery note (${qty(s.qty, it)})`,
    'No visible damage or leaks',
    it.hazmat ? 'Safety data sheet (MSDS) received and drums sealed' : 'Mill test certificate (MTC) received and matches',
    ...(s.bayan ? [`Customs cleared — Bayan # ${s.bayan}`] : []),
  ];
  const [ticked, setTicked] = useState([]);
  const all = ticked.length === checks.length;
  return (
    <Dialog title={`QA/QC inspection · ${s.id}`} onClose={onClose}>
      <p className="mb-4 text-slate-700">{qty(s.qty, it)} of <b>{it.name}</b> from {s.supplier}.</p>
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Tick each check</legend>
        {checks.map((c) => (
          <label key={c} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
            <input type="checkbox" className="mt-1 size-4" checked={ticked.includes(c)}
              onChange={(e) => setTicked((x) => (e.target.checked ? [...x, c] : x.filter((y) => y !== c)))} />
            <span>{c}</span>
          </label>
        ))}
      </fieldset>
      <p className="mt-4 text-sm text-slate-600">If it passes, it is released to stock at <b>{it.location}</b>.</p>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button className="btn border border-red-300 text-red-700 hover:bg-red-50" onClick={() => onResult(false)}>Reject shipment</button>
        <button className="btn btn-primary" disabled={!all} onClick={() => onResult(true)}>
          {all ? 'Pass QA/QC and store' : `Pass QA/QC and store (${ticked.length}/${checks.length} checked)`}
        </button>
      </div>
    </Dialog>
  );
}

function GatePassDialog({ request: r, item: it, site, onClose, onConfirm }) {
  const done = r.status === 'dispatched';
  const [truck, setTruck] = useState('');
  const [driver, setDriver] = useState('');
  const ready = truck.trim() && driver.trim();
  const value = r.qty * it.price;

  function confirmAndPrint() {
    onConfirm(truck.trim(), driver.trim());
    setTimeout(() => window.print(), 300); // let the gate pass number render first
  }

  return (
    <Dialog title={done ? `Gate pass ${r.gatePass}` : `Dispatch ${r.id}`} onClose={onClose}>
      <div className="print-area rounded-lg border border-slate-300 p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Oman material gate pass {done && `· ${r.gatePass}`}
        </p>
        <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
          <dt className="text-slate-500">From</dt><dd>{site}</dd>
          <dt className="text-slate-500">To</dt><dd className="font-medium">{r.rig}</dd>
          <dt className="text-slate-500">Request</dt><dd>{r.id}</dd>
          <dt className="text-slate-500">Item</dt><dd>{it.name} ({it.sku})</dd>
          <dt className="text-slate-500">Quantity</dt><dd className="font-medium">{qty(r.qty, it)}</dd>
          <dt className="text-slate-500">Pick from</dt><dd>{it.location}</dd>
          {done && <><dt className="text-slate-500">Truck</dt><dd>{r.truck}</dd><dt className="text-slate-500">Driver</dt><dd>{r.driver}</dd></>}
          {it.hazmat && <><dt className="text-slate-500">Safety</dt><dd className="text-red-700">Hazardous: carry the MSDS with the load</dd></>}
        </dl>
        <dl className="mt-4 border-t border-slate-200 pt-3 grid grid-cols-[1fr_auto] gap-y-1 text-sm">
          <dt>Value</dt><dd className="text-end">{omr(value)}</dd>
          <dt>VAT 5%</dt><dd className="text-end">{omr(value * VAT)}</dd>
          <dt className="font-semibold">Total</dt><dd className="text-end font-semibold">{omr(value * (1 + VAT))}</dd>
        </dl>
        {done && (
          <div className="mt-6 grid grid-cols-2 gap-6 text-xs text-slate-500">
            <p className="border-t border-slate-400 pt-1">Storekeeper signature</p>
            <p className="border-t border-slate-400 pt-1">Driver signature</p>
          </div>
        )}
      </div>

      {!done && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">Truck plate no.
            <input value={truck} onChange={(e) => setTruck(e.target.value)} placeholder="e.g. 48213 RA"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-medium">Driver name
            <input value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="e.g. Said Al-Balushi"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />
          </label>
        </div>
      )}
      {done && <p className="mt-4 rounded bg-green-50 p-2 text-sm font-medium text-green-800">Approved and dispatched. Stock updated.</p>}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
        {done ? (
          <>
            <button className="btn border border-slate-300 hover:bg-slate-50" onClick={() => window.print()}>Print</button>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </>
        ) : (
          <>
            {!ready && <span className="text-sm text-slate-600">Enter truck and driver to continue</span>}
            <button className="btn border border-slate-300 hover:bg-slate-50" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!ready} onClick={confirmAndPrint}>Confirm and print gate pass</button>
          </>
        )}
      </div>
    </Dialog>
  );
}

const MsdsBadge = ({ item, onOpen }) => (
  <button onClick={() => onOpen(item.sku)} className="ms-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 underline align-middle hover:bg-red-200">
    HAZMAT · MSDS · expires {fmtDate(item.hazmat.expiry)}
  </button>
);

function MsdsDialog({ item: it, onClose }) {
  const days = Math.ceil((new Date(it.hazmat.expiry) - new Date()) / 86400000);
  return (
    <Dialog title={`Safety data sheet · ${it.sku}`} onClose={onClose}>
      <p className="font-semibold">{it.name}</p>
      <p className="mt-1 text-red-700 font-medium">{it.hazmat.hazard}</p>
      <h3 className="mt-4 text-sm font-semibold">Handling rules</h3>
      <ul className="mt-2 list-disc ps-5 space-y-1">{it.hazmat.rules.map((r) => <li key={r}>{r}</li>)}</ul>
      <p className={`mt-4 rounded p-3 text-sm font-medium ${days <= 30 ? 'bg-amber-50 text-amber-900' : 'bg-slate-50 text-slate-700'}`}>
        Batch expires {fmtDate(it.hazmat.expiry)} ({days > 0 ? `${days} days left` : 'expired'}). First-expired, first-out: issue this batch before newer ones.
      </p>
      <div className="mt-6 flex justify-end"><button className="btn btn-primary" onClick={onClose}>Close</button></div>
    </Dialog>
  );
}

// Native <dialog> gives focus trapping and Escape-to-close for free.
function Dialog({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => { if (!ref.current.open) ref.current.showModal(); }, []);
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="dlg-title"
      className="m-auto w-[min(34rem,calc(100%-2rem))] rounded-xl p-0 shadow-xl backdrop:bg-slate-900/50">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 no-print">
        <h2 id="dlg-title" className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-500 hover:bg-slate-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}

function Toast({ toast, onClose, go }) {
  useEffect(() => { const x = setTimeout(onClose, 6000); return () => clearTimeout(x); }, [toast.key]);
  return (
    <div role="status" className="no-print fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(36rem,calc(100%-2rem))] rounded-xl bg-slate-900 p-4 text-white shadow-lg flex items-center gap-4">
      <p className="flex-1 text-sm">{toast.text}</p>
      {toast.next && <button className="btn bg-white text-slate-900 hover:bg-slate-200" onClick={() => go(toast.next.tab)}>{toast.next.label}</button>}
      <button onClick={onClose} aria-label="Dismiss" className="text-slate-300 hover:text-white">✕</button>
    </div>
  );
}

const Intro = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-semibold">{title}</h2>
    <p className="mt-1 text-slate-600">{children}</p>
  </div>
);

const FlowCard = ({ n, title, text, status, warn, go }) => (
  <li>
    <button onClick={go} className="card h-full w-full p-5 text-start hover:border-blue-400 hover:shadow-md transition">
      <span className="flex size-9 items-center justify-center rounded-full bg-blue-700 font-semibold text-white">{n}</span>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-slate-600">{text}</p>
      <p dir="ltr" className={`mt-4 text-sm font-medium ${warn ? 'text-amber-800' : 'text-blue-700'}`}>{status} →</p>
    </button>
  </li>
);

const Stat = ({ label, value }) => (
  <div className="card p-4">
    <p className="text-sm text-slate-600">{label}</p>
    <p className="mt-1 text-xl font-semibold" dir="ltr">{value}</p>
  </div>
);

const Attention = ({ tone, tag, text, action, go }) => (
  <li className="p-4 flex flex-wrap items-center gap-3">
    <Badge tone={tone}>{tag}</Badge>
    <span className="flex-1">{text}</span>
    <button className="text-sm font-medium text-blue-700 underline" onClick={go}>{action}</button>
  </li>
);

const Done = ({ title, rows }) => rows.length > 0 && (
  <>
    <h3 className="mt-8 mb-3 font-semibold">{title}</h3>
    <ul className="card divide-y divide-slate-200">
      {rows.map((r) => (
        <li key={r.key} className="p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>{r.text}</span>{r.badge}
        </li>
      ))}
    </ul>
  </>
);

const TONES = { red: 'bg-red-100 text-red-800', amber: 'bg-amber-100 text-amber-900', green: 'bg-green-100 text-green-800', blue: 'bg-blue-100 text-blue-800' };
const Badge = ({ tone, children }) => (
  <span className={`ms-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold align-middle ${TONES[tone]}`}>{children}</span>
);

const Empty = ({ children }) => <p className="card p-4 text-slate-600">{children}</p>;
const Link = ({ onClick, children }) => <button onClick={onClick} className="font-medium text-blue-700 underline">{children}</button>;
