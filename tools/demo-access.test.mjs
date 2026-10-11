import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDemoAccess, VISIT_MS } from './demo-access.mjs';

const registry = [{ code: '123456', slug: 'test', title: 'Test' }, { code: '654321', slug: 'other', title: 'Other' }];
async function setup() {
  const directory = await mkdtemp(join(tmpdir(), 'swd-demo-tests-'));
  let time = 100000;
  const access = createDemoAccess({ registry, directory, now: () => time });
  const codes = await access.initialize();
  return { access, directory, code: codes[0].accessCode, otherCode: codes[1].accessCode, advance: ms => { time += ms; } };
}
test('an incorrect code never consumes a visit', async () => {
  const { access, code } = await setup();
  await assert.rejects(access.unlock('123456', code === '0000' ? '9999' : '0000', 'test'), error => error.status === 401);
  assert.equal((await access.list())[0].remaining, 2);
});
test('each of two visits lasts exactly one hour, with a fresh hour for the second', async () => {
  const { access, code, advance } = await setup();
  const first = await access.unlock('123456', code, 'test');
  assert.equal(first.expiresAt, 100000 + VISIT_MS);
  advance(VISIT_MS - 1);
  assert.ok(await access.session('123456', first.token));
  advance(1);
  assert.equal(await access.session('123456', first.token), null);
  const second = await access.unlock('123456', code, 'test');
  assert.equal(second.expiresAt, 100000 + 2 * VISIT_MS);
  await assert.rejects(access.unlock('123456', code, 'test'), error => error.status === 403);
  assert.ok(await access.session('123456', second.token));
});
test('concurrent requests cannot issue a third visit', async () => {
  const { access, code } = await setup();
  const attempts = await Promise.allSettled(Array.from({ length: 5 }, (_, i) => access.unlock('123456', code, `person-${i}`)));
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 2);
  assert.equal((await access.list())[0].remaining, 0);
});
test('reset keeps the six-digit route, changes the password, and invalidates old sessions', async () => {
  const { access, code } = await setup();
  const first = await access.unlock('123456', code, 'test');
  const reset = await access.reset('123456');
  assert.equal(reset.code, '123456'); assert.notEqual(reset.accessCode, code);
  assert.equal(await access.session('123456', first.token), null);
  await assert.rejects(access.unlock('123456', code, 'test'), error => error.status === 401);
  assert.equal((await access.list())[0].remaining, 2);
});
test('a visitor token works for only its own demo and is not stored in plaintext', async () => {
  const { access, code, directory } = await setup();
  const visit = await access.unlock('123456', code, 'test');
  assert.equal(await access.session('654321', visit.token), null);
  assert.equal((await readFile(join(directory, 'demo-123456.json'), 'utf8')).includes(visit.token), false);
});
test('a new store instance sees persisted visits without cookies', async () => {
  const { access, code, directory } = await setup();
  const visit = await access.unlock('123456', code, 'test');
  const reopened = createDemoAccess({ registry, directory, now: () => 100000 });
  assert.ok(await reopened.session('123456', visit.token));
  assert.equal((await reopened.list())[0].remaining, 1);
});
test('failed attempts are limited and reset after the wait', async () => {
  const { access, advance } = await setup();
  for (let i = 0; i < 8; i++) await assert.rejects(access.unlock('123456', '0000', 'test'), error => error.status === 401);
  await assert.rejects(access.unlock('123456', '0000', 'test'), error => error.status === 429);
  advance(15 * 60 * 1000);
  await assert.rejects(access.unlock('123456', '0000', 'test'), error => error.status === 401);
});
test('unknown demo routes cannot initialize or reset a password', async () => {
  const { access } = await setup();
  await assert.rejects(access.reset('999999'), error => error.status === 404);
  await assert.rejects(access.unlock('999999', '1234', 'test'), error => error.status === 404);
});
