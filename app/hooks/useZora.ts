import { deployments } from '@pob/protocol';
import { useState, useEffect, useMemo } from 'react';
import { zdk } from '../clients/zdk';
import { CHAIN_ID, IPFS_LINK } from '../constants';
import { lowerCaseCheck } from '../utils/format';
import { OPENSEA_COLLECTION } from './useOpenSea';

const getOpenSeaPermaLink = (contract: string, tokenId: string) => {
  return `https://opensea.io/assets/ethereum/${contract}/${tokenId}`;
};

const getIpfsImageUrl = (ipfs: string) => {
  // image: "ipfs://bafkreigcm3qjawxsr5kiregdqibhaw3b6gif4inswurq6pm3eufdl7eo24"
  return `${IPFS_LINK}/${ipfs.includes('ipfs://') ? ipfs.substring(7) : ipfs}`;
};

export const useZoraLondonAssets = (owner: string): OPENSEA_COLLECTION[] => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const tokens = await zdk.tokens({
        where: {
          ownerAddresses: [owner],
          collectionAddresses: [
            deployments[CHAIN_ID].gift,
            deployments[CHAIN_ID].embers,
          ],
        },
      });
      console.log(tokens, 'zora fetch');
      if (tokens?.tokens?.nodes?.length > 0) {
        setData(tokens.tokens.nodes);
      }
    };
    fetchData().catch(console.error);
  }, [owner]);
  return useMemo(() => {
    let collections = [
      {
        name: 'LONDON GIFT',
        contract: deployments[1].gift,
        avatar:
          'https://lh3.googleusercontent.com/vLhzyu6MRPDr7NjDTA3l5F45iuI5yE0qOWuMJg_rNAfCtLXQUz2P5wEoW5xiUfpXrerEMcPDFE3Ze86ofnNP6vY3taCHKbSOPxvVmw=s0',
        url: 'https://opensea.io/collection/london-gift-v2',
        assets: [],
      },
      {
        name: 'LONDON EMBERS',
        contract: deployments[1].embers,
        avatar:
          'https://lh3.googleusercontent.com/8tv123j9iH0EnObnPAU9HkYva3RiOMBzKzG4MPqVBGrhGNj181INp1SyHOOuJt1Anc8bQKHFo9IYzq5qtZdBci1UbB56bO7d8Go9wg=s0',
        url: 'https://opensea.io/collection/london-embers',
        assets: [],
      },
    ];
    if (data?.length > 0) {
      data.forEach((node: any) => {
        const token = node.token;
        const contract = token.tokenContract.collectionAddress;
        const name = token.name;
        const id = token.tokenId;
        const link = getOpenSeaPermaLink(contract, id);
        const metadata = token.content;
        const image = getIpfsImageUrl(token.image.url);
        collections.forEach((collection: any) => {
          // console.log(collection, 'collection');
          // console.log(contract, 'contract');
          if (lowerCaseCheck(collection.contract, contract)) {
            collection.assets.push({
              name,
              image,
              id,
              metadata,
              link,
            });
          }
        });
      });
    }
    console.log(collections, 'collections');
    return collections;
  }, [data.length]);
};
