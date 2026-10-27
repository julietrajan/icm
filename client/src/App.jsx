import { useCallback, useEffect, useMemo, useState } from 'react';
import IncidentForm from './components/IncidentForm.jsx';
import IncidentDetail from './components/IncidentDetail.jsx';
import Modal from './components/Modal.jsx';
import { formatDate, isActive, label, priorities, statuses } from './models/incident.js';
import { incidentService } from './services/incidentService.js';
import { downloadIncidentCsv } from './services/incidentCsv.js';

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [view, setView] = useState('all');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sort, setSort] = useState('updated');
  const [theme, setTheme] = useState(document.documentElement.dataset.theme);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await incidentService.list();
      setIncidents(data);
      setSelected((current) => current ? data.find((item) => item.id === current.id) ?? null : null);
    } catch (exception) { setError(exception.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timeout);
  }, [notice]);

  const active = incidents.filter(isActive);
  const resolved = incidents.filter((item) => !isActive(item));
  const critical = active.filter((item) => item.priority === 'Critical');
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return incidents.filter((item) =>
      (view !== 'active' || isActive(item)) &&
      (view !== 'resolved' || !isActive(item)) &&
      (!status || item.status === status) && (!priority || item.priority === priority) &&
      [item.number, item.title, item.description, item.assignedTo, item.reportedBy, item.category]
        .some((value) => value.toLowerCase().includes(search)))
      .sort((a, b) => sort === 'priority'
        ? priorities.indexOf(a.priority) - priorities.indexOf(b.priority) || new Date(b.updatedAt) - new Date(a.updatedAt)
        : new Date(b[sort === 'created' ? 'createdAt' : 'updatedAt']) - new Date(a[sort === 'created' ? 'createdAt' : 'updatedAt']));
  }, [incidents, view, query, status, priority, sort]);

  function closeModal() { setModal(null); setError(''); }
  function openCreate() { setSelected(null); setError(''); setModal('create'); }
  function exportCsv() {
    if (loading || busy || !filtered.length) return;
    try {
      downloadIncidentCsv(filtered);
    } catch (exception) { setError(`CSV export failed: ${exception.message}`); }
  }
  async function mutate(operation, message, nextModal) {
    setBusy(true); setError(''); setNotice('');
    try {
      const updated = await operation();
      if (updated) {
        setIncidents((current) => [updated, ...current.filter((item) => item.id !== updated.id)]);
        setSelected(updated);
      } else {
        setIncidents((current) => current.filter((item) => item.id !== selected.id));
        setSelected(null);
      }
      setModal(nextModal);
      setNotice(message);
      return true;
    } catch (exception) { setError(exception.message); return false; }
    finally { setBusy(false); }
  }
  const switchView = (next) => { setView(next); setStatus(''); setPriority(''); setQuery(''); };
  const title = view === 'active' ? 'Active incidents' : view === 'resolved' ? 'Resolved incidents' : 'All incidents';
  const modalTitle = modal === 'create' ? 'Create incident' : modal === 'edit' ? 'Edit incident' : modal === 'delete' ? 'Delete incident?' : selected?.title;

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="./"><span className="brand-symbol">i</span><span>Incident<span className="brand-light">Desk</span><small>OPERATIONS WORKSPACE</small></span></a>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        <button className={view === 'all' ? 'nav-item active' : 'nav-item'} onClick={() => switchView('all')}><span className="nav-icon">#</span>All incidents<span className="nav-count">{incidents.length}</span></button>
        <button className={view === 'active' ? 'nav-item active' : 'nav-item'} onClick={() => switchView('active')}><span className="nav-icon">!</span>Active incidents<span className="nav-count">{active.length}</span></button>
        <button className={view === 'resolved' ? 'nav-item active' : 'nav-item'} onClick={() => switchView('resolved')}><span className="nav-icon">/</span>Resolved<span className="nav-count">{resolved.length}</span></button>
      </nav>
      <div className="storage-card"><span className="storage-dot" /><strong>Local file storage</strong><p>Your workspace, without a database. Changes are saved by the API.</p><code>Data/incidents.json</code></div>
      <div className="sidebar-footer">INCIDENT MANAGEMENT <span>v1.0</span></div>
    </aside>
    <div className="main-shell">
      <header className="topbar" aria-label="Application header"><div className="header-brand"><strong>IncidentDesk</strong><span>Incident management workspace</span></div>
        <button className="theme-button" onClick={() => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); document.documentElement.dataset.theme = next; }}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button></header>
      <main>
        <div className="page-heading"><div><p className="eyebrow">SERVICE OPERATIONS</p><h1>Keep every incident in view.</h1><p className="muted">Track issues, coordinate your response, and get back to what matters.</p></div>
          <button className="primary new-button" onClick={openCreate}><span aria-hidden="true">+</span> New incident</button></div>
        {notice && <div className="notice" role="status">{notice}</div>}
        {error && !modal && <div className="error" role="alert">{error}<button onClick={load}>Retry</button></div>}
        <section className="stats" aria-label="Incident overview">
          {[['Total incidents', incidents.length, 'Every issue, one place', 'total'], ['Active incidents', active.length, 'Awaiting a resolution', 'active'], ['Critical incidents', critical.length, 'Active and highest priority', 'critical'], ['Resolved & closed', resolved.length, 'Back on track', 'resolved']].map(([name, count, caption, type]) =>
            <article className={`stat-card stat-${type}`} key={name}><div className="stat-label">{name}<span className="stat-dot" /></div><strong>{loading ? '--' : count}</strong><p>{caption}</p></article>)}
        </section>
        <section className="incident-panel">
          <header className="panel-heading"><div><h2>{title} <span className="count">{filtered.length}</span></h2><p className="muted">A clear picture of your service operations.</p></div><div className="panel-actions"><button onClick={exportCsv} disabled={loading || busy || !filtered.length}>Export CSV</button><button onClick={load} disabled={loading || busy}>{loading ? 'Refreshing...' : 'Refresh'}</button></div></header>
          <div className="toolbar"><label className="search"><span aria-hidden="true">&#9906;</span><input aria-label="Search incidents" placeholder="Search incidents, people, or keywords..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select>
            <select aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="">All priorities</option>{priorities.map((value) => <option key={value}>{value}</option>)}</select>
            <select aria-label="Sort incidents" value={sort} onChange={(event) => setSort(event.target.value)}><option value="updated">Recently updated</option><option value="created">Newest first</option><option value="priority">Highest priority</option></select>
          </div>
          {loading ? <div className="empty-state" role="status"><div className="empty-symbol">...</div><h3>Loading your workspace</h3><p>Getting the latest incidents from your API.</p></div>
            : filtered.length === 0 ? <div className="empty-state"><div className="empty-symbol">#</div><h3>{incidents.length ? 'No matching incidents' : 'A fresh start for your service desk'}</h3><p>{incidents.length ? 'Try a different search or clear your filters.' : 'Create your first incident to start tracking issues and resolutions.'}</p>
              {incidents.length ? <button onClick={() => switchView('all')}>Clear filters</button> : <button className="primary" onClick={openCreate}>+ Create your first incident</button>}</div>
              : <div className="table-scroll"><table><thead><tr><th>Incident</th><th>Status</th><th>Priority</th><th>Assigned to</th><th>Updated</th><th><span className="sr-only">Details</span></th></tr></thead>
                <tbody>{filtered.map((incident) => <tr key={incident.id}><td><button className="incident-link" onClick={() => { setSelected(incident); setError(''); setModal('detail'); }}><span className="incident-number">{incident.number} <span>{incident.category}</span></span><strong>{incident.title}</strong></button></td>
                  <td><span className={`badge status-${incident.status}`}>{label(incident.status)}</span></td>
                  <td><span className={`priority priority-${incident.priority}`}><span className="priority-dot" />{incident.priority}</span></td>
                  <td>{incident.assignedTo || <span className="muted">Unassigned</span>}</td><td className="date-cell">{formatDate(incident.updatedAt)}</td>
                  <td><button className="icon-button" aria-label={`View ${incident.number}`} onClick={() => { setSelected(incident); setError(''); setModal('detail'); }}>&#8594;</button></td></tr>)}</tbody></table></div>}
          <footer className="panel-footer"><span>{filtered.length} of {incidents.length} incidents</span><span>Stored locally. Ready when you are.</span></footer>
        </section>
      </main>
      <footer className="page-footer" aria-label="Application footer"><div><strong>IncidentDesk</strong><span>Built for calmer operations.</span></div><span>Local workspace / v1.0</span></footer>
    </div>
    {modal && <Modal title={modalTitle} subtitle={selected?.number ?? 'NEW INCIDENT'} onClose={closeModal} busy={busy}>
      {error && <div className="error modal-error" role="alert">{error}{selected && <button disabled={busy} onClick={async () => {
        setBusy(true);
        try {
          const fresh = await incidentService.get(selected.id);
          setSelected(fresh); setModal('detail'); setError('');
          setIncidents((current) => current.map((item) => item.id === fresh.id ? fresh : item));
        } catch (exception) { setError(exception.message); }
        finally { setBusy(false); }
      }}>Reload incident</button>}</div>}
      {(modal === 'create' || modal === 'edit') && <IncidentForm key={modal === 'create' ? 'new' : selected.id} incident={modal === 'edit' ? selected : null} busy={busy} onCancel={closeModal} onSave={(data) => mutate(() => modal === 'edit' ? incidentService.update(selected.id, data) : incidentService.create(data), modal === 'edit' ? 'Incident updated.' : 'Incident created.', 'detail')} />}
      {modal === 'detail' && selected && <IncidentDetail incident={selected} busy={busy} onEdit={() => setModal('edit')} onDelete={() => setModal('delete')} onAddNote={(note) => mutate(() => incidentService.addNote(selected.id, note), 'Note added.', 'detail')} />}
      {modal === 'delete' && selected && <div className="delete-content"><p>Permanently delete <strong>{selected.number}</strong> and its notes? This cannot be undone.</p><footer className="form-footer"><button disabled={busy} onClick={() => setModal('detail')}>Cancel</button><button className="danger-button" disabled={busy} onClick={() => mutate(() => incidentService.delete(selected.id, selected.version), 'Incident deleted.', null)}>{busy ? 'Deleting...' : 'Delete incident'}</button></footer></div>}
    </Modal>}
  </div>;
}
