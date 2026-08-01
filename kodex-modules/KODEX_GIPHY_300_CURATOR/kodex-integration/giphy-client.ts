import type { KodexGiphyAsset } from './asset-types';

const ENDPOINT = 'https://api.giphy.com/v1/gifs';

export async function getFreshGiphyAsset(
  id: string,
  apiKey: string,
  metadata: KodexGiphyAsset
) {
  const url = `${ENDPOINT}/${encodeURIComponent(id)}?api_key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GIPHY lookup failed: ${response.status}`);
  const payload = await response.json();
  const gif = payload.data;

  return {
    ...metadata,
    current: {
      pageUrl: gif.url,
      creator: gif.username || gif.user?.display_name || metadata.attribution.creator,
      previewWebp: gif.images?.fixed_height?.webp,
      originalWebp: gif.images?.original?.webp,
      originalGif: gif.images?.original?.url,
      width: Number(gif.images?.original?.width || 0),
      height: Number(gif.images?.original?.height || 0),
    }
  };
}
