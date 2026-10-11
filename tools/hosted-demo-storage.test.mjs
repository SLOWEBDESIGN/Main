import test from 'node:test';
import assert from 'node:assert/strict';
import { createHostedDemoStorage } from './hosted-demo-storage.mjs';
import { createDemoAccess } from './demo-access.mjs';

function database() {
  const rows = new Map();
  return {
    from() { return { select() { return { eq(_column, key) { return {
      async maybeSingle() { return { data: structuredClone(rows.get(key) ?? null), error: null }; },
    }; } }; } }; },
    async rpc(_name, { p_key, p_expected_version, p_state }) {
      const old = rows.get(p_key);
      if ((old?.version ?? null) !== p_expected_version) return { data: false, error: null };
      rows.set(p_key, { state: structuredClone(p_state), version: (old?.version ?? 0) + 1 });
      return { data: true, error: null };
    },
  };
}
test('separate hosted instances cannot issue more than two concurrent visits', async () => {
  const client = database();
  const registry = [{ code: '123456', slug: 'test', title: 'Test' }];
  const first = createDemoAccess({ registry, storage: createHostedDemoStorage(client) });
  const second = createDemoAccess({ registry, storage: createHostedDemoStorage(client) });
  const [demo] = await first.initialize();
  const results = await Promise.allSettled(Array.from({ length: 6 }, (_, i) =>
    (i % 2 ? first : second).unlock('123456', demo.accessCode, `caller-${i}`)));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 2);
  assert.equal((await second.list())[0].remaining, 0);
  const visit = results.find(result => result.status === 'fulfilled').value;
  assert.ok(await second.session('123456', visit.token));
  await first.reset('123456');
  assert.equal(await second.session('123456', visit.token), null);
});
test('database failures deny access rather than falling back to local disk', async () => {
  const client = { from() { return { select() { return { eq() { return {
    async maybeSingle() { return { data: null, error: { message: 'Unavailable' } }; },
  }; } }; } }; } };
  await assert.rejects(createHostedDemoStorage(client).read('demo-123456'), error => error.status === 503);
});
