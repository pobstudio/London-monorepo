import React from 'react';
import App from 'next/app';
import { AnalyticsProvider } from 'use-analytics';
import { ThemedGlobalStyle } from '../theme';
import { LocalStorageEffect } from '../effects/LocalStorageEffect';
import { SearchModal } from '../components/modals/search';
import { BlockchainEffect } from '../effects/BlockchainEffect';
import { CHAIN_ID, HASH_PROD_LINK, GLOBAL_OG_BANNER } from '../constants';
import { WalletModal } from '../components/modals/wallet';
import { EagerConnectEffect } from '../effects/EagerConnectEffect';
import { TokensEffect } from '../effects/TokensEffect';
import { TransactionsEffect } from '../effects/TransactionsEffect';
import { CollectionEffect } from '../effects/CollectionEffect';
import { useModalStore } from '../stores/modal';
import { ScrollLockWrapper } from '../components/ScrollLockWrapper';
import { ToastsEffect } from '../effects/ToastEffect';
import { Toasts } from '../components/toast';
import { WalletEffect } from '../effects/WalletEffect';
import { analytics } from '../analytics';
import { AnalyticsEffect } from '../effects/AnalyticsEffect';
import { DefaultSeo } from 'next-seo';
import { Web3ReactProvider } from '@web3-react/core';
import { ApolloProvider } from '@apollo/client';
import {
  BlockNumber,
  BlockNumberCornerWrapper,
} from '../components/blockchainNumber';
import whyDidYouRender from '@welldone-software/why-did-you-render';
import { MenuModal } from '../components/modals/menu';
import { ethers } from 'ethers';
import { AppProvider } from '../contexts/app';
import { pobSubgraphClient } from '../clients';
import { CheckoutFooter } from '../components/checkout/cart-footer';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('initiating wdyr');
  whyDidYouRender(React as any, { trackAllPureComponents: true });
}

const getLibrary = (provider: any) => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 15000;
  return library;
};

export default class PobApp extends App {
  render() {
    const { Component, pageProps } = this.props;

    const { err } = this.props as any;
    const modifiedPageProps = { ...pageProps, err };
    return (
      <>
        <DefaultSeo
          title={`$HASH by POB - Ethereum's history tokenized`}
          description={'Generative art fueled by tx metadata.'}
          openGraph={{
            type: 'website',
            locale: 'en_US',
            url: HASH_PROD_LINK,
            title: `$HASH by POB - Ethereum's history tokenized`,
            description: 'Generative art fueled by tx metadata.',
            site_name: 'POB',
            images: [
              {
                url: GLOBAL_OG_BANNER,
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
              content: GLOBAL_OG_BANNER,
            },
            {
              name: 'twitter:url',
              content: HASH_PROD_LINK,
            },
          ]}
        />
        <ThemedGlobalStyle />
        <AppProvider>
          <ApolloProvider client={pobSubgraphClient}>
            <AnalyticsProvider instance={analytics}>
              <ScrollLockWrapper>
                <Web3ReactProvider getLibrary={getLibrary}>
                  {/** Effects are any tasks that strictly only makes state changes to stores */}
                  <LocalStorageEffect />
                  <BlockchainEffect />
                  <EagerConnectEffect />
                  <TokensEffect />
                  <TransactionsEffect />
                  <CollectionEffect />
                  <WalletEffect />
                  <ToastsEffect />
                  <AnalyticsEffect />
                  {/** Modals */}
                  <SearchModal />
                  <WalletModal />
                  <MenuModal />
                  <BlockNumberCornerWrapper>
                    <BlockNumber />
                  </BlockNumberCornerWrapper>
                  {/** Fixed Components */}
                  <CheckoutFooter />
                  {/** Component */}
                  <Component {...modifiedPageProps} />
                </Web3ReactProvider>
              </ScrollLockWrapper>
            </AnalyticsProvider>
          </ApolloProvider>
        </AppProvider>
      </>
    );
  }
}
