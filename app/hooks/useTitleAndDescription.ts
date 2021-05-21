import { useMemo } from 'react';
import {
  NULL_ADDRESS,
  TokenMetadataKey,
  TOKEN_METADATA_HASH_TO_READABLE_KEYS_MAP,
} from '../constants';
import { getDefaultTitle } from '../utils/defaults';
import { useTokenMetadata } from './useTokenMetadata';
import find from 'lodash/find';
import { useCallback } from 'react';
import { useHash } from './useHash';
import { shortenHexString } from '../utils/hex';

export const useTitleAndDescription = (tokenId: string | undefined) => {
  const hash = useHash(tokenId);

  const defaultTitle = useMemo(
    () => (!!hash ? shortenHexString(hash, 6) : '-'),
    [hash],
  );
  const { status, owner, documents, updateMetadata } = useTokenMetadata(
    tokenId,
  );
  const titleDocument = useMemo(
    () =>
      find(
        documents,
        (d) => d.key === TOKEN_METADATA_HASH_TO_READABLE_KEYS_MAP['title'],
      ),
    [documents],
  );
  const descriptionDocument = useMemo(
    () =>
      find(
        documents,
        (d) =>
          d.key === TOKEN_METADATA_HASH_TO_READABLE_KEYS_MAP['description'],
      ),
    [documents],
  );

  const writer = useMemo(() => {
    if (titleDocument?.writer === NULL_ADDRESS) {
      return descriptionDocument?.writer;
    }
    return titleDocument?.writer;
  }, [titleDocument, descriptionDocument]);

  const updateTitleAndDescription = useCallback(
    (title: string, description: string) => {
      const keys: TokenMetadataKey[] = [];
      const texts: string[] = [];
      if (title !== titleDocument?.text) {
        keys.push('title');
        texts.push(title);
      }
      if (description !== descriptionDocument?.text) {
        keys.push('description');
        texts.push(description);
      }
      updateMetadata(keys, texts);
    },
    [updateMetadata, titleDocument, descriptionDocument],
  );

  return {
    updateTitleAndDescription,
    owner,
    writer,
    status,
    title:
      !!titleDocument && titleDocument.text !== ''
        ? titleDocument.text
        : defaultTitle,
    description:
      !!descriptionDocument && descriptionDocument.writer !== ''
        ? descriptionDocument.text
        : undefined,
  };
};
