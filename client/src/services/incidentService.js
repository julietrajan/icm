async function request(path = '', options = {}) {
  const response = await fetch(`/api/incidents${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    const problem = contentType.includes('json') ? await response.json() : null;
    const validation = problem?.errors ? Object.values(problem.errors).flat().join(' ') : '';
    throw new Error(validation || problem?.detail || problem?.title || `Request failed (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

export const incidentService = {
  list: () => request(),
  get: (id) => request(`/${id}`),
  create: (incident) => request('', { method: 'POST', body: JSON.stringify(incident) }),
  update: (id, incident) => request(`/${id}`, { method: 'PUT', body: JSON.stringify(incident) }),
  addNote: (id, note) => request(`/${id}/notes`, { method: 'POST', body: JSON.stringify(note) }),
  delete: (id, version) => request(`/${id}?version=${version}`, { method: 'DELETE' }),
};
