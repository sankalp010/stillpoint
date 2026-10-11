import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const origin = process.env.SMOKE_API_ORIGIN || 'http://127.0.0.1:4000/api';
const webOrigin = process.env.SMOKE_WEB_ORIGIN || 'http://localhost:3000';

async function request(path, { cookie, method = 'GET', body } = {}) {
  const response = await fetch(`${origin}${path}`, {
    method,
    headers: { Origin: webOrigin, ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  return { response, data, cookie: response.headers.get('set-cookie')?.split(';')[0] || cookie };
}

const makeUser = async () => {
  const result = await request('/auth/register', { method: 'POST', body: { name: 'Local Smoke', email: `smoke-${randomUUID()}@example.test`, password: 'local-smoke-password' } });
  assert.equal(result.response.status, 201, JSON.stringify(result.data));
  assert.ok(result.cookie, 'registration should establish an HttpOnly session cookie');
  return result.cookie;
};

const ownerCookie = await makeUser();
const bank = await request('/problems/counts', { cookie: ownerCookie });
assert.equal(bank.response.status, 200);
assert.ok(bank.data.counts.easy > 0 && bank.data.counts.medium > 0 && bank.data.counts.hard > 0);

const created = await request('/sessions', { cookie: ownerCookie, method: 'POST', body: { durationMinutes: 45 } });
assert.equal(created.response.status, 200, JSON.stringify(created.data));
const active = created.data.session;
assert.equal(active.problems.length, 3);
assert.deepEqual(active.problems.map(problem => problem.difficulty), ['easy', 'medium', 'hard']);
assert.equal(active.problems.some(problem => 'referenceAnswer' in problem || 'hiddenTests' in problem), false);
assert.equal(new Date(active.deadlineAt) - new Date(active.startedAt), 45 * 60 * 1000);

const otherCookie = await makeUser();
const unauthorized = await request(`/sessions/${active.id}`, { cookie: otherCookie });
assert.equal(unauthorized.response.status, 404);

const missingJudge0 = await request(`/sessions/${active.id}/problems/${active.problems[0].id}/submissions`, { cookie: ownerCookie, method: 'POST', body: { sourceCode: 'function solve(){return 1}' } });
assert.equal(missingJudge0.response.status, 503);

const finished = await request(`/sessions/${active.id}/finish`, { cookie: ownerCookie, method: 'POST' });
assert.equal(finished.response.status, 200);
assert.ok(finished.data.session.problems.every(problem => typeof problem.referenceAnswer === 'string'));
assert.equal(finished.data.session.score, 0);
console.log('API smoke check passed: registration, question assignment, key redaction, ownership, evaluator-unavailable state, and review.');
