import { launch, Page } from 'puppeteer-core';
import { RENDER_URL, OG_GRAPH_BANNER } from './constants';
import { getOptions } from './options';
import { FileType } from './types';

let _page: Page | null;

async function getPage(isDev: boolean) {
  if (_page) {
    return _page;
  }
  const options = await getOptions(isDev);
  const browser = await launch(options);
  _page = await browser.newPage();
  return _page;
}

export async function getScreenshot(
  type: FileType,
  quality: number,
  dimensions: [number, number],
  isDev: boolean,
) {
  const page = await getPage(isDev);
  await page.setViewport({
    width: dimensions[0],
    height: dimensions[1],
  });
  await page.goto(`FILL THIS`);
  const file = await page.screenshot({ type, quality });
  return file as Buffer;
}
