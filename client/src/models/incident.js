export const statuses = ['New', 'InProgress', 'OnHold', 'Resolved', 'Closed'];
export const priorities = ['Critical', 'High', 'Medium', 'Low'];
export const responseTargets = {
  Critical: '15 minutes',
  High: '30 minutes',
  Medium: '4 hours',
  Low: '1 business day',
};
export const categories = ['Application', 'Hardware', 'Network', 'Security', 'Access', 'Other'];
export const label = (value) => ({ InProgress: 'In progress', OnHold: 'On hold' }[value] ?? value);
export const responseTarget = (priority) => Object.hasOwn(responseTargets, priority) ? responseTargets[priority] : '';
export const isActive = (incident) => !['Resolved', 'Closed'].includes(incident.status);
export const isOverdue = (incident, now = Date.now()) =>
  isActive(incident) && now - new Date(incident.updatedAt).getTime() >= 24 * 60 * 60 * 1000;
export const emptyIncident = () => ({
  title: '', description: '', priority: 'Medium', category: 'Application',
  reportedBy: '', assignedTo: '', status: 'New',
});
export const formatDate = (value) => new Date(value).toLocaleString(undefined, {
  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
