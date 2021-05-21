import React from 'react';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
  NextPageContext,
} from 'next';
import { ContentWrapper, MainContent } from '../../components/content';
import { Header } from '../../components/header';
import { Carousel } from '../../components/carousel';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { shortenHexString } from '../../utils/hex';
import { ROUTES } from '../../constants/routes';
import { getArtworkPreviewUrl } from '../../utils/urls';
import {
  ALCHEMY_KEY,
  CHAIN_ID,
  DRAW_ALCHEMY_KEY,
  HASH_PROD_LINK,
  TokenMetadataKey,
  ZERO,
} from '../../constants';
import { AlchemyProvider } from '@ethersproject/providers';
import {
  deployments,
  HashRegistry__factory,
  TokenMetadataRegistry__factory,
  Multicall__factory,
} from '@pob/protocol';
import { TX_HASH_REGEX } from '../../utils/regex';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { Art } from '../../components/art';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { hash } = context.query;
  const provider = new AlchemyProvider(CHAIN_ID, ALCHEMY_KEY);
  const registry = HashRegistry__factory.connect(
    deployments[CHAIN_ID].hashRegistry,
    provider,
  );
  const metadataRegistry = TokenMetadataRegistry__factory.connect(
    deployments[CHAIN_ID].metadataRegistry,
    provider,
  );
  const multiCall = Multicall__factory.connect(
    deployments[CHAIN_ID].multicall,
    provider,
  );
  if (!TX_HASH_REGEX.test(hash as string)) {
    return { props: { hash } };
  }
  const tokenId = await registry.txHashToTokenId(hash as string);
  if (BigNumber.from(tokenId).eq(ZERO)) {
    return { props: { hash } };
  }
  const titleDocumentCalldata = metadataRegistry.interface.encodeFunctionData(
    'tokenIdToDocumentMap',
    [tokenId, 'title' as TokenMetadataKey],
  );
  const descriptionDocumentCalldata = metadataRegistry.interface.encodeFunctionData(
    'tokenIdToDocumentMap',
    [tokenId, 'description' as TokenMetadataKey],
  );
  const calls = [
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
  const titleDocumentRes = metadataRegistry.interface.decodeFunctionResult(
    'tokenIdToDocumentMap',
    callRes[1][0],
  );
  const descriptionDocumentRes = metadataRegistry.interface.decodeFunctionResult(
    'tokenIdToDocumentMap',
    callRes[1][1],
  );

  return {
    props: {
      hash,
      tokenId: tokenId.toHexString(),
      title: titleDocumentRes.text === '' ? null : titleDocumentRes.text,
      description:
        descriptionDocumentRes.text === '' ? null : descriptionDocumentRes.text,
    },
  };
};

const ArtworkPage: NextPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { hash, title, description, tokenId } = props;
  const seoTitle = useMemo(() => {
    if (!title) {
      return `POB - Artwork ${shortenHexString(hash)}...`;
    }
    return `POB - Artwork '${title}'`;
  }, [hash, title]);
  const seoDescription = useMemo(() => {
    if (!description) {
      return `Painted by POB`;
    }
    return `${description.slice(0, 40)}${description.length > 40 ? '...' : ''}`;
  }, [hash, description]);

  return (
    <>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: `${HASH_PROD_LINK}${ROUTES.ART}/${hash}`,
          title: seoTitle,
          description: seoDescription,
          site_name: 'POB',
          images: [
            {
              url: getArtworkPreviewUrl(hash),
              // width: 800,
              // height: 418,
              alt: 'POB',
            },
          ],
        }}
        twitter={{
          handle: '@prrfbeauty',
          site: '@prrfbeauty',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'twitter:image',
            content: getArtworkPreviewUrl(hash),
          },
          {
            name: 'twitter:url',
            content: `${HASH_PROD_LINK}${ROUTES.ART}/${hash}`,
          },
        ]}
      />
      <ContentWrapper>
        <Header />
        <MainContent style={{ height: 'auto' }}>
          <Art hashOrId={hash as string} />
        </MainContent>
      </ContentWrapper>
    </>
  );
};

export default React.memo(ArtworkPage);
