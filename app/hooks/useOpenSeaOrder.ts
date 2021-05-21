import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '../utils/fetcher';
import isPast from 'date-fns/isPast';
import { BigNumber, ethers } from 'ethers';
import { formatBigNumberSafe } from '../utils/format';

export interface PrettyOrder {
  payment_token: {
    address: string;
    decimals: number;
    name: string;
    symbol: string;
  };
  current_price?: BigNumber;
  order_type: 'english_auction' | 'sale' | 'dutch_auction';
}

export const useOpenSeaOrder = (
  tokenId: string | undefined,
): PrettyOrder | undefined => {
  const { data } = useSWR(
    useMemo(() => (!!tokenId ? `/api/os-metadata?&id=${tokenId}` : null), [
      tokenId,
    ]),
    fetcher,
    {},
  );
  const orders = useMemo(() => {
    if (!data) {
      return undefined;
    }
    if (!data.os?.orders) {
      return;
    }
    const os = data.os.orders;
    return os
      .filter((o: any) => o.side === 1) // only filter for sells
      .filter((o: any) => !o.cancelled && !o.finalized && !o.marked_invalid) // only filter for valid active orders
      .filter(
        (o: any) =>
          o.expiration_time === 0 || !isPast(o.expiration_time * 1000),
      ); // filter out any expired orders
  }, [data]);
  const firstOrder = useMemo(() => {
    return orders?.[0];
  }, [orders]);

  return useMemo(() => {
    if (!firstOrder) {
      return undefined;
    }
    return {
      payment_token: firstOrder.payment_token_contract,
      current_price: formatBigNumberSafe(
        firstOrder.current_price.slice(
          0,
          firstOrder.current_price.indexOf('.') === -1
            ? undefined
            : firstOrder.current_price.indexOf('.'),
        ),
      ), // HACK: OS returns strs with decimal throws an error for formatting to a BN
      order_type: 'sale', // TODO, figure out how to detect and create pretty orders for other sale types
    };
  }, [firstOrder]);
};

export const useFormattedPriceFromOS = (tokenId: string | undefined) => {
  const order = useOpenSeaOrder(tokenId);
  return useMemo(() => {
    return !!order && !!order.current_price
      ? `${ethers.utils.formatUnits(
          order.current_price,
          order.payment_token.decimals,
        )} ${order.payment_token.symbol}`
      : undefined;
  }, [order]);
};
