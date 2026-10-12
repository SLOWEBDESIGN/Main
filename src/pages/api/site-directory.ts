import type { NextApiRequest, NextApiResponse } from 'next';
import directory from '@/src/data/status-directory.json';

export default function siteDirectory(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json(directory);
}
