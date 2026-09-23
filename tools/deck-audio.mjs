#!/usr/bin/env node
// Builds the locked-audio assets for the unlisted pitch-deck page (public/<slug>/a/).
//
//   node tools/deck-audio.mjs --src <video-with-audio.mp4> --out <public/<slug>/a> --pin 1234 --token <long random string>
//
// Writes into --out:
//   rec.mp4  the same video with the audio track removed. Public, this is what everyone gets.
//   rec.bin  the with-audio video, AES-256-GCM encrypted under a random content key K.
//   k.json   K wrapped twice: once under a key derived from the PIN (PBKDF2), once under the
//            share-link token (SHA-256; the token is high-entropy so no stretching is needed).
//
// Neither the PIN nor the token is written anywhere in the output, and nothing here needs a server:
// the page derives the key in the browser and decrypts rec.bin locally. Re-run with the same --src
// to change the PIN or rotate the token; every old link stops working.
//
// A 4-digit PIN has only 10,000 possibilities, so it keeps casual viewers out but is not a
// defence against someone willing to script guesses. The token is the strong path.
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes, createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const { src, out, pin, token } = args;
if (!src || !out || !/^\d{4}$/.test(pin || '') || (token || '').length < 16) {
  console.error('usage: deck-audio.mjs --src <mp4 with audio> --out <dir> --pin <4 digits> --token <16+ chars>');
  process.exit(1);
}

const PBKDF2_ITER = 300000;
const seal = (key, iv, plain) => {
  const c = createCipheriv('aes-256-gcm', key, iv);
  return Buffer.concat([c.update(plain), c.final(), c.getAuthTag()]); // WebCrypto expects ciphertext||tag
};
const open = (key, iv, boxed) => {
  const d = createDecipheriv('aes-256-gcm', key, iv);
  d.setAuthTag(boxed.subarray(boxed.length - 16));
  return Buffer.concat([d.update(boxed.subarray(0, boxed.length - 16)), d.final()]);
};
const pinKey = (salt) => pbkdf2Sync(pin, salt, PBKDF2_ITER, 32, 'sha256');
const tokKey = () => createHash('sha256').update(token, 'utf8').digest();

mkdirSync(out, { recursive: true });
const video = readFileSync(src);

const K = randomBytes(32);
const ivVideo = randomBytes(12);
const saltPin = randomBytes(16), ivPin = randomBytes(12), ivTok = randomBytes(12);

writeFileSync(join(out, 'rec.bin'), seal(K, ivVideo, video));
writeFileSync(join(out, 'k.json'), JSON.stringify({
  v: 1,
  pin: { salt: saltPin.toString('base64'), iter: PBKDF2_ITER, iv: ivPin.toString('base64'), wrap: seal(pinKey(saltPin), ivPin, K).toString('base64') },
  tok: { iv: ivTok.toString('base64'), wrap: seal(tokKey(), ivTok, K).toString('base64') },
  video: { iv: ivVideo.toString('base64'), type: 'video/mp4' },
}));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-an', '-c:v', 'copy', '-movflags', '+faststart', join(out, 'rec.mp4')]);

// Self-test: unwrap K both ways from the files just written and round-trip the video.
const m = JSON.parse(readFileSync(join(out, 'k.json'), 'utf8'));
const b = (s) => Buffer.from(s, 'base64');
const kPin = open(pinKey(b(m.pin.salt)), b(m.pin.iv), b(m.pin.wrap));
const kTok = open(tokKey(), b(m.tok.iv), b(m.tok.wrap));
const back = open(kPin, b(m.video.iv), readFileSync(join(out, 'rec.bin')));
const sha = (x) => createHash('sha256').update(x).digest('hex');
if (!kPin.equals(K) || !kTok.equals(K) || sha(back) !== sha(video)) { console.error('SELF-TEST FAILED'); process.exit(2); }
console.log('ok: rec.mp4 (silent), rec.bin (%d bytes), k.json; pin + token both unwrap the key; round-trip sha256 matches', readFileSync(join(out, 'rec.bin')).length);
