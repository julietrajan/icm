export const statuses = ['New', 'InProgress', 'OnHold', 'Resolved', 'Closed'];
export const priorities = ['Critical', 'High', 'Medium', 'Low'];
export const categories = ['Application', 'Hardware', 'Network', 'Security', 'Access', 'Other'];
export const label = (value) => ({ InProgress: 'In progress', OnHold: 'On hold' }[value] ?? value);
export const isActive = (incident) => !['Resolved', 'Closed'].includes(incident.status);
export const emptyIncident = () => ({
  title: '', description: '', priority: 'Medium', category: 'Application',
  reportedBy: '', assignedTo: '', status: 'New',
});
export const formatDate = (value) => new Date(value).toLocaleString(undefined, {
  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
