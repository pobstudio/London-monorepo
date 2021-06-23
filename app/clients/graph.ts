import { ApolloClient, InMemoryCache } from '@apollo/client';
import {
  CHAIN_ID,
  GRAPH_SUBGRAPH_LINK,
  GRAPH_TEST_SUBGRAPH_LINK,
} from '../constants';

export const subgraphClient = new ApolloClient({
  uri: CHAIN_ID === 1 ? GRAPH_SUBGRAPH_LINK : GRAPH_TEST_SUBGRAPH_LINK,
  cache: new InMemoryCache(),
});
