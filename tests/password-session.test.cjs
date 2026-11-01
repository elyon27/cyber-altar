const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync('src/app/api/pilgrim/session/route.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function route(user, rpcResult = { data: { exists: true, name: 'Test Pilgrim' }, error: null }) {
  const calls = [];
  const context = { exports: {}, require: name => {
    if (name === 'next/server') return { NextResponse: { json: (body, options) => new Response(JSON.stringify(body), options) } };
    if (name === '@/lib/supabase/admin') return { createAdminSupabaseClient: () => {
      calls.push('admin');
      return { auth: { getUser: async token => { calls.push({ token }); return { data: { user }, error: null }; } },
        rpc: async (name, params) => { calls.push({ name, params }); return rpcResult; } };
    } };
    throw new Error(`Unexpected import ${name}`);
  } };
  vm.runInNewContext(compiled, context);
  return { get: context.exports.GET, calls };
}
test('unsigned requests never access the admin client', async () => {
  const r = route(null);
  const response = await r.get(new Request('https://example.test/api/pilgrim/session?email=someone@example.test'));
  assert.equal(response.status, 401);
  assert.equal(r.calls.length, 0);
});
test('missing or unconfirmed users cannot resolve enrollment', async () => {
  for (const user of [null, { email: 'unconfirmed@example.test' }]) {
    const r = route(user);
    const response = await r.get(new Request('https://example.test/api/pilgrim/session', { headers: { Authorization: 'Bearer invalid-token' } }));
    assert.equal(response.status, 401);
    assert.equal(r.calls.filter(x => x.name).length, 0);
  }
});
test('only the verified token email is used, regardless of URL parameters', async () => {
  const r = route({ email: 'OWNER@example.test', email_confirmed_at: '2026-01-01' });
  const response = await r.get(new Request('https://example.test/api/pilgrim/session?email=other@example.test', { headers: { Authorization: 'Bearer verified-token' } }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { email: 'owner@example.test', name: 'Test Pilgrim' });
  assert.equal(r.calls.find(x => x.params).params.p_email, 'owner@example.test');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
test('unenrolled accounts and backend failures do not return another identity', async () => {
  for (const [result, status] of [[{ data: { exists: false }, error: null }, 409], [{ data: null, error: { message: 'private database detail' } }, 503]]) {
    const r = route({ email: 'owner@example.test', email_confirmed_at: '2026-01-01' }, result);
    const response = await r.get(new Request('https://example.test/api/pilgrim/session', { headers: { Authorization: 'Bearer verified-token' } }));
    assert.equal(response.status, status);
    assert.equal((await response.text()).includes('private database detail'), false);
  }
});
