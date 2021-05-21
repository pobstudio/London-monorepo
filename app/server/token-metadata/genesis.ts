import { AlchemyProvider } from '@ethersproject/providers';
import {
  deployments,
  TokenMetadataRegistry__factory,
  Multicall__factory,
  HashRegistry__factory,
} from '@pob/protocol';
import {
  generateGeneFromTxHash,
  generateTokenAttributesFromGene,
} from '../../sketches/genesis';
import { BigNumber } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  ALCHEMY_KEY,
  CHAIN_ID,
  DRAW_ALCHEMY_KEY,
  NULL_ADDRESS,
  HASH_PROD_LINK,
  TokenMetadataKey,
  ZERO,
} from '../../constants';
import { ROUTES } from '../../constants/routes';
import { shortenHexString, padHexString } from '../../utils/hex';
import { getEditionFromTokenId } from '../../utils/token';
import { getMintedArtworkPreviewUrl } from '../../utils/urls';

const provider = new AlchemyProvider(CHAIN_ID, ALCHEMY_KEY);
const drawProvider = new AlchemyProvider(1, DRAW_ALCHEMY_KEY);

const registry = HashRegistry__factory.connect(
  deployments[CHAIN_ID].hashRegistry,
  provider,
);
const multiCall = Multicall__factory.connect(
  deployments[CHAIN_ID].multicall,
  provider,
);
const metadataRegistry = TokenMetadataRegistry__factory.connect(
  deployments[CHAIN_ID].metadataRegistry,
  provider,
);

export const handleGenesisMetadata = async (
  id: string,
  res: NextApiResponse,
) => {
  // checks if token exists
  const hashCalldata = registry.interface.encodeFunctionData(
    'tokenIdToTxHash',
    [id],
  );
  const titleDocumentCalldata = metadataRegistry.interface.encodeFunctionData(
    'tokenIdToDocumentMap',
    [id, 'title' as TokenMetadataKey],
  );
  const descriptionDocumentCalldata = metadataRegistry.interface.encodeFunctionData(
    'tokenIdToDocumentMap',
    [id, 'description' as TokenMetadataKey],
  );

  const calls = [
    {
      target: registry.address,
      callData: hashCalldata,
    },
    {
      target: metadataRegistry.address,
      callData: titleDocumentCalldata,
    },
    {
      target: metadataRegistry.address,
      callData: descriptionDocumentCalldata,
    },
  ];

  const callRes = await multiCall.callStatic.aggregate(calls);
  const hash = registry.interface.decodeFunctionResult(
    'tokenIdToTxHash',
    callRes[1][0],
  )[0] as BigNumber;
  const titleDocumentRes = metadataRegistry.interface.decodeFunctionResult(
    'tokenIdToDocumentMap',
    callRes[1][1],
  );
  const descriptionDocumentRes = metadataRegistry.interface.decodeFunctionResult(
    'tokenIdToDocumentMap',
    callRes[1][2],
  );

  if (hash.eq(ZERO)) {
    res
      .status(404)
      .json({ statusCode: 404, message: 'id has not been minted yet.' });
    return;
  }

  const paddedHashStr = padHexString(hash.toHexString());

  const gene = await generateGeneFromTxHash(drawProvider, paddedHashStr);

  const attributes = await generateTokenAttributesFromGene(gene);

  const edNum = getEditionFromTokenId(BigNumber.from(id).toHexString());
  // res.setHeader(
  //   'Cache-Control',
  //   `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  // );
  res.status(200).json({
    name:
      titleDocumentRes.writer !== NULL_ADDRESS
        ? titleDocumentRes.text
        : `NO. ${edNum} (${shortenHexString(paddedHashStr)})`,
    description:
      descriptionDocumentRes.writer !== NULL_ADDRESS
        ? `
        ${descriptionDocumentRes.text} <br>
        TX HASH: ${paddedHashStr} <br> 
        NO: ${edNum} <br>
        WRITER: ${descriptionDocumentRes.writer}`
        : `Painted by POB. <br> TX HASH: ${paddedHashStr} <br> 
        NO: ${edNum}
        ${
          titleDocumentRes.writer !== NULL_ADDRESS
            ? `<br> WRITER: ${titleDocumentRes.writer}`
            : ''
        }`,
    image: getMintedArtworkPreviewUrl(id),
    external_link: `${HASH_PROD_LINK}${ROUTES.ART}/${paddedHashStr}`,
    algorithmStoredTxHash: deployments[CHAIN_ID].genesis,
    properties: {
      ...attributes,
      season: {
        name: 'Season',
        value: 'GENESIS',
      },
      tokenSymbol: {
        name: 'Token Symbol',
        value: '$HASH',
      },
      minting: {
        name: 'Minting',
        value: `GENESIS`,
      },
      no: {
        name: 'NO.',
        value: edNum,
      },
      writer: {
        name: 'Writer',
        display_value:
          descriptionDocumentRes.writer !== NULL_ADDRESS
            ? shortenHexString(descriptionDocumentRes.writer)
            : 'No Writer',
        value: descriptionDocumentRes.writer,
      },
      tx: {
        name: 'Tx',
        value: paddedHashStr,
        display_value: shortenHexString(paddedHashStr),
      },
    },
    background_color: '232323',
  });
};
