import { getScreenshot } from '../../server/screenshots';
import { VercelRequest, VercelResponse } from '@vercel/node';

const isDev = !process.env.AWS_REGION;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    let file: Buffer = Buffer.alloc(0);
    file = await getScreenshot(
      'jpeg',
      70,
      [1000, 1000],
      isDev,
    );
    res.statusCode = 200;
    res.setHeader('Content-Type', `image/jpeg`);
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
    res.end(file);
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>Internal Error</h1><p>Sorry, there was a problem</p>');
  }
}
