import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import download from 'downloadjs';
import { useTokenId } from './useTokenId';
import { useWeb3React } from '@web3-react/core';
import { getPrintedArtworkPreviewUrl } from '../utils/urls';
import { useOwnerByHash, useOwnerByTokenId } from './useOwner';

const useDownloadArt = (seed: string | undefined) => {
  const tokenId = useTokenId(seed);
  const { account } = useWeb3React();
  const owner = useOwnerByTokenId(tokenId);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!tokenId || account?.toLowerCase() !== owner) {
      return;
    }
    if (isDownloading) {
      return;
    }
    setIsDownloading(true);
    const res = await fetch(getPrintedArtworkPreviewUrl(tokenId));
    setIsDownloading(false);
    if (res.ok) {
      download(await res.blob(), `${seed}.jpeg`);
    }
  }, [isDownloading, tokenId, account, owner, seed]);

  const downloadReady = account?.toLowerCase() === owner && !!tokenId;

  const state = useMemo(() => {
    return {
      downloadReady,
      isDownloading,
      handleDownload,
    };
  }, [downloadReady, isDownloading, handleDownload]);

  return state;
};

export { useDownloadArt };
