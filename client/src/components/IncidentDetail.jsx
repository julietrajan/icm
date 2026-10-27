import { useState } from 'react';
import { formatDate, label } from '../models/incident.js';

export default function IncidentDetail({ incident, busy, onEdit, onDelete, onAddNote }) {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (await onAddNote({ author: author.trim(), text: text.trim() })) setText('');
  }
  return <div className="detail-content">
    <div className="badge-row"><span className={`badge priority-${incident.priority}`}>{incident.priority} priority</span>
      <span className={`badge status-${incident.status}`}>{label(incident.status)}</span><span className="badge">{incident.category}</span></div>
    <p className="description">{incident.description}</p>
    <dl className="detail-grid">
      <div><dt>Reported by</dt><dd>{incident.reportedBy}</dd></div>
      <div><dt>Assigned to</dt><dd>{incident.assignedTo || 'Unassigned'}</dd></div>
      <div><dt>Created</dt><dd>{formatDate(incident.createdAt)}</dd></div>
      <div><dt>Last updated</dt><dd>{formatDate(incident.updatedAt)}</dd></div>
      {incident.resolvedAt && <div><dt>Resolved</dt><dd>{formatDate(incident.resolvedAt)}</dd></div>}
    </dl>
    <div className="detail-actions"><button onClick={onEdit} disabled={busy}>Edit incident</button>
      <button className="danger-text" onClick={onDelete} disabled={busy}>Delete incident</button></div>
    <section className="notes"><h3>Notes <span className="count">{incident.notes.length}</span></h3>
      {incident.notes.length === 0 && <p className="muted">No notes yet. Add context or a progress update.</p>}
      {incident.notes.map((note) => <article className="note" key={note.id}><header><strong>{note.author}</strong><time>{formatDate(note.createdAt)}</time></header><p>{note.text}</p></article>)}
      <form onSubmit={submit}><fieldset disabled={busy}>
        <label>Your name<input required maxLength={100} value={author} onChange={(event) => setAuthor(event.target.value)} /></label>
        <label>Add a note<textarea required maxLength={4000} rows={3} placeholder="Share an update..." value={text} onChange={(event) => setText(event.target.value)} /></label>
      </fieldset><button className="primary" disabled={busy || !author.trim() || !text.trim()}>{busy ? 'Saving...' : 'Add note'}</button></form>
    </section>
  </div>;
}
