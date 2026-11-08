const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function cache(owner) {
  const storage = () => Object.defineProperties({}, {
    getItem: { value(key) { return this[key] ?? null; } },
    setItem: { value(key, value) { this[key] = value; } },
    removeItem: { value(key) { delete this[key]; } },
  });
  const localStorage = storage(), sessionStorage = storage();
  if (owner) localStorage.setItem('cyber_altar_cache_owner', owner);
  const context = { exports: {}, localStorage, sessionStorage };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/account-cache.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return { ...context.exports, localStorage, sessionStorage };
}
test('deletion clears JSON dedication keys and legacy personal data in both stores', () => {
  const c = cache('deleted-id');
  for (const s of [c.localStorage, c.sessionStorage]) {
    s.setItem(JSON.stringify(['cyber_altar_dedication', 'same@example.test', 'al001']), 'Old dedication');
    s.setItem('cyber_altar_history_same@example.test', 'Old history');
    s.setItem('unrelated', 'keep');
  }
  c.clearAccountCache();
  for (const s of [c.localStorage, c.sessionStorage]) assert.deepEqual(Object.keys(s), ['unrelated']);
});
test('recreated account with the same email cannot inherit the old identity cache', () => {
  const c = cache('deleted-id');
  c.localStorage.setItem('cyber_altar_history_same@example.test', 'old');
  c.scopeAccountCache('new-id');
  assert.equal(c.localStorage.getItem('cyber_altar_history_same@example.test'), null);
  assert.equal(c.localStorage.getItem('cyber_altar_cache_owner'), 'new-id');
  c.localStorage.setItem('cyber_altar_history_same@example.test', 'new');
  c.scopeAccountCache('new-id');
  assert.equal(c.localStorage.getItem('cyber_altar_history_same@example.test'), 'new');
});
