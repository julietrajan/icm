import assert from 'node:assert/strict';
import test from 'node:test';
import { isOverdue, priorities, responseTarget } from '../client/src/models/incident.js';

const now = Date.parse('2026-11-25T12:00:00Z');

test('every priority has its required response target', () => {
  const expected = {
    Critical: '15 minutes',
    High: '30 minutes',
    Medium: '4 hours',
    Low: '1 business day',
  };
  for (const priority of priorities) {
    assert.equal(responseTarget(priority), expected[priority], priority);
  }
  assert.equal(responseTarget('Unknown'), '');
});

test('active incidents become overdue at exactly 24 hours since their last update', () => {
  for (const status of ['New', 'InProgress', 'OnHold']) {
    assert.equal(isOverdue({ status, updatedAt: '2026-11-24T12:00:00.001Z' }, now), false, status);
    assert.equal(isOverdue({ status, updatedAt: '2026-11-24T12:00:00Z' }, now), true, status);
    assert.equal(isOverdue({ status, updatedAt: '2026-11-24T11:59:59.999Z' }, now), true, status);
  }
});

test('resolved and closed incidents are never overdue regardless of age', () => {
  for (const status of ['Resolved', 'Closed']) {
    assert.equal(isOverdue({ status, updatedAt: '2026-01-01T00:00:00Z' }, now), false, status);
  }
});

test('fresh and future updates are not overdue, including after an old incident is updated', () => {
  const incident = { status: 'InProgress', updatedAt: '2026-11-20T12:00:00Z' };
  assert.equal(isOverdue(incident, now), true);
  assert.equal(isOverdue({ ...incident, updatedAt: '2026-11-25T12:00:00Z' }, now), false);
  assert.equal(isOverdue({ ...incident, updatedAt: '2026-11-26T12:00:00Z' }, now), false);
});
