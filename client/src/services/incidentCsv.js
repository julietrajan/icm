import { label } from '../models/incident.js';

const columns = [
  ['Reference', (incident) => incident.number],
  ['Title', (incident) => incident.title],
  ['Status', (incident) => label(incident.status)],
  ['Priority', (incident) => incident.priority],
  ['Category', (incident) => incident.category],
  ['Reporter', (incident) => incident.reportedBy],
  ['Assignee', (incident) => incident.assignedTo],
  ['Created At', (incident) => timestamp(incident.createdAt)],
  ['Updated At', (incident) => timestamp(incident.updatedAt)],
  ['Resolved At', (incident) => timestamp(incident.resolvedAt)],
];

function timestamp(value) {
  return value ? new Date(value).toISOString() : '';
}

function escapeCell(value) {
  const text = String(value ?? '');
  const safe = /^[\s\u0000-\u001f]*[=+\-@]|^[\s\u0000-\u001f]*[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function incidentsToCsv(incidents) {
  const rows = [columns.map(([header]) => header), ...incidents.map((incident) => columns.map(([, value]) => value(incident)))];
  return '\uFEFF' + rows.map((row) => row.map(escapeCell).join(',')).join('\r\n') + '\r\n';
}

export function downloadIncidentCsv(incidents) {
  if (!incidents.length) return;
  const blob = new Blob([incidentsToCsv(incidents)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  try {
    anchor.href = url;
    anchor.download = `incidents-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}