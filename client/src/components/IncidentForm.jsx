import { useState } from 'react';
import { categories, emptyIncident, label, priorities, statuses } from '../models/incident.js';

export default function IncidentForm({ incident, onSave, onCancel, busy }) {
  const [form, setForm] = useState(() => incident ? { ...incident } : emptyIncident());
  const field = (name) => ({
    value: form[name],
    onChange: (event) => setForm({ ...form, [name]: event.target.value }),
  });

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSave({
      ...form, title: form.title.trim(), description: form.description.trim(),
      reportedBy: form.reportedBy.trim(), assignedTo: form.assignedTo.trim(),
    }); }} className="incident-form">
      <fieldset disabled={busy}>
        <label>Incident title <span>*</span><input autoFocus required minLength={3} maxLength={160}
          placeholder="A short summary of the issue" {...field('title')} /></label>
        <label>Description <span>*</span><textarea required minLength={5} maxLength={10000} rows={5}
          placeholder="What happened? Include the impact and steps to reproduce." {...field('description')} /></label>
        <div className="form-grid">
          <label>Priority<select {...field('priority')}>{priorities.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Category<select {...field('category')}>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Reported by <span>*</span><input required maxLength={100} placeholder="Your name" {...field('reportedBy')} /></label>
          <label>Assigned to<input maxLength={100} placeholder="Unassigned" {...field('assignedTo')} /></label>
          {incident && <label>Status<select {...field('status')}>{statuses.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>}
        </div>
      </fieldset>
      <footer className="form-footer"><button type="button" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="primary" disabled={busy}>{busy ? 'Saving...' : incident ? 'Save changes' : 'Create incident'}</button></footer>
    </form>
  );
}
