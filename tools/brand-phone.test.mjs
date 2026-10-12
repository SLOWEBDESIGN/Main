import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
function load(file, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, process: { env: { NODE_ENV: 'development' } },
    require: id => Object.hasOwn(imports, id) ? imports[id] : require(id) });
  return exports;
}
const schema = load('src/lib/schema.ts');
const data = load('src/data/atelier.ts');
const content = load('src/lib/studioContent.ts', { './schema': schema, '@/src/data/atelier': data });
const number = /530\D?215\D?5987|tel:/;

test('SD has no business phone setting; SLO keeps its existing number and link', () => {
  for (const host of ['sdwebdesign.tech', 'www.sdwebdesign.tech', 'sdwebdesign.localhost:3011']) {
    const copy = schema.getBrandCopy(schema.getBrandVariant(host));
    assert.equal(copy.phone, null);
    assert.equal(copy.phoneHref, null);
    assert.doesNotMatch(copy.locationLine, number);
    assert.equal(copy.contactEmail, 'contact@slowebdesign.com');
  }
  const slo = schema.getBrandCopy('slowebdesign');
  assert.equal(slo.phone, '530-215-5987');
  assert.equal(slo.phoneHref, 'tel:+15302155987');
  assert.equal(slo.locationLine, 'San Luis Obispo, California • 530-215-5987');
});

test('SD structured data and Markdown omit the phone, SLO retains it', () => {
  for (const factory of [schema.generateLocalBusinessSchema, content.studioSchema]) {
    assert.equal(Object.hasOwn(factory('sdwebdesign'), 'telephone'), false);
    assert.doesNotMatch(JSON.stringify(factory('sdwebdesign')), number);
    assert.match(factory('slowebdesign').telephone, number);
  }
  assert.doesNotMatch(content.studioMarkdown('sdwebdesign'), number);
  assert.doesNotMatch(content.studioMarkdown('sdwebdesign'), /- Phone:/);
  assert.match(content.studioMarkdown('slowebdesign'), /\n- Phone: \+1-530-215-5987\n/);
});

test('rendered machine page and original-site footer hide only SD phone links', () => {
  const imports = { '@/src/lib/schema': schema, '@/src/data/atelier': data,
    '@/src/lib/studioContent': content, 'next/head': { default: ({ children }) => children } };
  const Machine = load('src/pages/machine.tsx', imports).default;
  const Footer = load('src/components/Footer.tsx', imports).Footer;
  for (const Component of [Machine, Footer]) {
    const sd = renderToStaticMarkup(React.createElement(Component, { variant: 'sdwebdesign' }));
    const slo = renderToStaticMarkup(React.createElement(Component, { variant: 'slowebdesign' }));
    assert.doesNotMatch(sd, number);
    assert.match(sd, /contact@slowebdesign.com/);
    assert.match(slo, /href="tel:\+15302155987"/);
    assert.match(slo, /530-215-5987/);
  }
});
