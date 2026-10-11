import test from 'node:test';
import assert from 'node:assert/strict';
import { isLoopbackPreviewRequest } from './local-demo-preview.mjs';

const local = { environment: 'development', host: '127.0.0.1:3011', remoteAddress: '127.0.0.1' };
test('development loopback permits a local preview', () => {
  assert.equal(isLoopbackPreviewRequest(local), true);
  assert.equal(isLoopbackPreviewRequest({ ...local, host: 'localhost:3011', remoteAddress: '::1' }), true);
  assert.equal(isLoopbackPreviewRequest({ ...local, host: '[::1]:3011', remoteAddress: '::ffff:127.0.0.1' }), true);
});
test('production and test environments never bypass even on localhost', () => {
  for (const environment of ['production', 'test', undefined])
    assert.equal(isLoopbackPreviewRequest({ ...local, environment }), false);
});
test('public hosts cannot bypass through loopback or forwarded headers', () => {
  for (const host of ['slowebdesign.com', 'sdwebdesign.tech', 'site.netlify.app', 'localhost.example.com'])
    assert.equal(isLoopbackPreviewRequest({ ...local, host }), false);
});
test('remote callers cannot bypass by forging the localhost host', () => {
  for (const remoteAddress of ['192.168.1.2', '203.0.113.2', undefined])
    assert.equal(isLoopbackPreviewRequest({ ...local, remoteAddress }), false);
});
