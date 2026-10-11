import { getStore } from '@netlify/blobs';
import { resolve } from 'node:path';
import { createDemoAssets } from '../../../tools/demo-assets.mjs';

export function demoAssets() {
  if (process.env.NODE_ENV === 'production' && !process.env.DEMO_LOCAL_PREVIEW) {
    return createDemoAssets({
      store: getStore({ name: 'private-website-demos', consistency: 'strong' }),
      version: process.env.DEMO_ASSETS_VERSION,
    });
  }
  return createDemoAssets({ root: resolve(process.cwd(), 'private-demos/artifacts') });
}
