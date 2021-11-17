import fetch from 'isomorphic-fetch';

export const graphQlFetcher = async (url: string, query: string) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    throw new Error(`Graph QL response for ${url} is not ok.`);
  }
  return (await res.json()).data;
};
