const fetch = require('node-fetch');

const PINTEREST_SEARCH_URL = 'https://www.pinterest.com/resource/BaseSearchResource/get/';

const SEARCH_QUERIES = ['funny memes', 'dank memes', 'hilarious memes', 'memes 2024'];

/**
 * Builds the Pinterest search API query string.
 * @param {string} query - Search term
 * @returns {string} Full URL with query params
 */
function buildSearchUrl(query) {
  const data = {
    options: {
      query,
      scope: 'pins',
      page_size: 25,
      bookmarks: [],
    },
    context: {},
  };

  const params = new URLSearchParams({
    source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
    data: JSON.stringify(data),
  });

  return `${PINTEREST_SEARCH_URL}?${params.toString()}`;
}

/**
 * Fetches meme image results from Pinterest's internal search API.
 * Returns an array of objects with { url, pinUrl }.
 */
async function fetchMemeImages() {
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
  const url = buildSearchUrl(query);

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*, q=0.01',
      'Accept-Language': 'en-US,en;q=0.9',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://www.pinterest.com/',
    },
  });

  if (!response.ok) {
    throw new Error(`Pinterest API responded with status ${response.status}`);
  }

  const json = await response.json();

  const pins =
    json?.resource_response?.data?.results ||
    json?.resource_response?.data ||
    [];

  if (!Array.isArray(pins) || pins.length === 0) {
    throw new Error('No pins returned from Pinterest API');
  }

  const images = pins
    .filter((pin) => pin?.images?.orig?.url || pin?.images?.['736x']?.url)
    .map((pin) => ({
      url: pin.images?.orig?.url || pin.images?.['736x']?.url,
      pinUrl: pin.id ? `https://www.pinterest.com/pin/${pin.id}/` : null,
    }));

  return images;
}

module.exports = { fetchMemeImages };
