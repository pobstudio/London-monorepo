import { getEmberGene, computeEmbers, getEmbersTokenMetadataFromGene } from '.';
import { ensureDir } from 'fs-extra';
import { writeFile, readFile, createWriteStream, WriteStream } from 'fs';
import { promisify } from 'util';
import path from 'path';
import { renderEmbersAsGif } from './render-embers-gif';

const getTokenMetadataAndImage = async (
  seed: string,
  imageStream: WriteStream,
): Promise<[string]> => {
  const gene = getEmberGene(seed, 'noble');
  await renderEmbersAsGif(gene, imageStream);
  const tokenMetadata = getEmbersTokenMetadataFromGene(
    `LOCAL_BUILD`,
    gene,
    'LOCAL_BUILD',
  );
  return [tokenMetadata];
};

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const SUPPLY = 2000;
const METADATA_DIR = path.resolve(
  __dirname,
  '..',
  'out',
  'embers',
  'token-metadata',
);
const IMAGE_DIR = path.resolve(__dirname, '..', 'out', 'embers', 'image-gif');
const seedCore = 'local-build-';

(async () => {
  await ensureDir(METADATA_DIR);
  await ensureDir(IMAGE_DIR);
  for (let i = 0; i < SUPPLY; ++i) {
    const gifStream = createWriteStream(path.resolve(IMAGE_DIR, `${i}.gif`));
    const [tm] = await getTokenMetadataAndImage(seedCore + i, gifStream);
    console.log(`${i} / ${SUPPLY}`);
    await writeFileAsync(
      path.resolve(METADATA_DIR, `${i}.json`),
      JSON.stringify(tm),
    );
  }
})();
