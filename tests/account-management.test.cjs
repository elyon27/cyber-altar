const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function route(file, user, deletionError = null) {
  const calls = [];
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, console, TextEncoder, require: name => {
    if (name === 'next/server') return { NextResponse: { json: (body, options) => new Response(JSON.stringify(body), options) } };
    if (name === '@/lib/supabase/admin') return { createAdminSupabaseClient: () => ({
      auth: { getUser: async () => ({ data: { user }, error: null }), admin: { deleteUser: async (...args) => { calls.push(args); return { error: deletionError }; } } },
      rpc: async (...args) => { calls.push(args); return { data: { name: 'New Name' }, error: null }; },
    }) };
    throw new Error(`Unexpected import ${name}`);
  } };
  vm.runInNewContext(code, context);
  return { ...context.exports, calls };
}
const user = { id: 'verified-user', email: 'owner@example.test', email_confirmed_at: '2026-11-08' };
function request(body, token = 'valid') {
  return new Request('https://example.test/api/account', { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
}
test('account deletion requires sign-in, verified identity, and explicit confirmation', async () => {
  for (const [identity, body, token, status] of [[user, { confirmation: 'DELETE' }, '', 401], [null, { confirmation: 'DELETE' }, 'valid', 401], [{ ...user, email_confirmed_at: null }, { confirmation: 'DELETE' }, 'valid', 401], [user, { confirmation: 'delete' }, 'valid', 400]]) {
    const r = route('src/app/api/account/route.ts', identity);
    assert.equal((await r.DELETE(request(body, token))).status, status);
    assert.equal(r.calls.length, 0);
  }
});
test('deletion ignores supplied target and deletes only authenticated user', async () => {
  const r = route('src/app/api/account/route.ts', user);
  const response = await r.DELETE(request({ confirmation: 'DELETE', id: 'victim', email: 'victim@example.test' }));
  assert.equal(response.status, 200);
  assert.equal(JSON.stringify(r.calls), JSON.stringify([[user.id, false]]));
});
test('deletion failures are reported without false success', async () => {
  const r = route('src/app/api/account/route.ts', user, { code: 'database_error' });
  assert.equal((await r.DELETE(request({ confirmation: 'DELETE' }))).status, 503);
});
test('rename rejects unsigned requests and another account email', async () => {
  for (const [email, token] of [['owner@example.test', ''], ['other@example.test', 'valid']]) {
    const r = route('src/app/api/pilgrim/route.ts', user);
    const req = new Request('https://example.test/api/pilgrim', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ action: 'rename', email, name: 'New Name', expectedName: 'Old Name' }) });
    assert.equal((await r.POST(req)).status, 401);
    assert.equal(r.calls.length, 0);
  }
});
