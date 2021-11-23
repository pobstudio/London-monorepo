import { getEmberGene, renderEmbers, getEmbersTokenMetadataFromGene } from ".";
import { ensureDir } from 'fs-extra';
import { writeFile, readFile, createReadStream } from 'fs';
import { promisify } from 'util';
import path from "path";

const getTokenMetadataAndImage = async (
  seed: string,
): Promise<[string, string]> => {
  const gene = getEmberGene(seed);
  const image = renderEmbers(gene);
  const tokenMetadata = getEmbersTokenMetadataFromGene(
    `LOCAL_BUILD`,
    gene,
    'LOCAL_BUILD',
  );
  return [tokenMetadata, image] ;
};

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const SUPPLY = 2000;
const METADATA_DIR = path.resolve(__dirname, '..', 'out', 'embers', 'token-metadata');
const IMAGE_DIR = path.resolve(__dirname, '..', 'out', 'embers', 'image');
const seedCore = 'local-build-';

(async () => {
  await ensureDir(METADATA_DIR);
  await ensureDir(IMAGE_DIR);
  for (let i = 0; i < SUPPLY; ++i) {
    const [tm, img] = await getTokenMetadataAndImage(seedCore + i);
    console.log(`${i} / ${SUPPLY}`);
    await writeFileAsync(
      path.resolve(METADATA_DIR, `${i}.json`),
      JSON.stringify(tm),
    );
    await writeFileAsync(
      path.resolve(IMAGE_DIR, `${i}.svg`),
      img,
    );
  }
})();