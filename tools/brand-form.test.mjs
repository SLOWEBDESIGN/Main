import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
}).outputText;
const branding = { exports: {} };
vm.runInNewContext(compile('src/lib/schema.ts'), { exports: branding.exports, process: { env: {} } });

function formFixture(variant, response) {
  const values = [{ name: 'Sample', email: 'sample@example.com', description: 'A sample project', website: '' }, '', '', 'idle', '', ''];
  let cursor = 0;
  const requests = [];
  const module = { exports: {} };
  const hooks = { ...React, useEffect() {}, useRef: () => ({ current: false }),
    useState(initial) {
      const index = cursor++;
      if (!(index in values)) values[index] = initial;
      return [values[index], next => { values[index] = typeof next === 'function' ? next(values[index]) : next; }];
    },
  };
  vm.runInNewContext(compile('src/components/atelier/ApplicationForm.tsx'), {
    exports: module.exports,
    require: id => id === 'react' ? hooks : id === '@/src/lib/schema' ? branding.exports : require(id),
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: response === 'success', status: response === 'success' ? 200 : 400, json: async () => ({ error: 'invalid_email' }) };
    },
  });
  const render = () => { cursor = 0; return module.exports.default({ variant }); };
  return { render, requests, html: () => renderToStaticMarkup(render()) };
}

for (const variant of ['sdwebdesign', 'slowebdesign']) {
  test(`${variant} renders the intended form, success, and error wording`, async () => {
    const success = formFixture(variant, 'success');
    const sd = variant === 'sdwebdesign';
    assert.match(success.html(), sd ? /placeholder="Where we can reply"/ : /placeholder="Where Ben can reply"/);
    await success.render().props.onSubmit({ preventDefault() {} });
    const sent = success.html();
    assert.match(sent, sd ? /We will read your note and reply to/ : /Ben will read your note and reply to/);
    assert.match(sent, /sample@example.com/);
    assert.equal(success.requests[0].url, '/api/contact');
    assert.equal(JSON.parse(success.requests[0].options.body).description, 'A sample project');
    const invalid = formFixture(variant, 'invalid');
    await invalid.render().props.onSubmit({ preventDefault() {} });
    const error = invalid.html();
    assert.match(error, sd ? /Check your email address so we can reply/ : /Check your email address so Ben can reply/);
    assert.match(error, /value="sample@example.com"/);
    if (sd) for (const html of [sent, error]) assert.doesNotMatch(html, /\bBen\b|Benyamin/i);
  });
}
