const fetch = require('node-fetch');

const PINTEREST_API_URL = 'https://api.pinterest.com/v5/pins/search';

const SEARCH_QUERIES = ['funny memes', 'dank memes', 'hilarious memes', 'memes 2024'];

const IMAGE_SIZES = ['1200x', '736x', '600x', '400x'];

/** @type {Array<{ url: string, pinUrl: string }>} */
const imageQueue = [];

const MIN_QUEUE_SIZE = 10;

/**
 * Extracts the best available image URL from a pin's media object.
 * Tries each preferred size in order, falling back to the next.
 * @param {object} pin
 * @returns {string|null}
 */
function extractImageUrl(pin) {
  const images = pin?.media?.images;
  if (!images) return null;

  for (const size of IMAGE_SIZES) {
    if (images[size]?.url) return images[size].url;
  }

  return null;
}

/**
 * Fetches a batch of meme images from the Pinterest v5 API and
 * pushes them into the shared queue.
 */
async function refillQueue() {
  const token = process.env.PINTEREST_TOKEN;
  if (!token) {
    throw new Error('Missing PINTEREST_TOKEN environment variable.');
  }

  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];

  const params = new URLSearchParams({
    query,
    page_size: '25',
  });

  const response = await fetch(`${PINTEREST_API_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Pinterest API responded with status ${response.status}`);
  }

  const json = await response.json();
  const pins = json?.items ?? [];

  if (!Array.isArray(pins) || pins.length === 0) {
    throw new Error('No pins returned from Pinterest API');
  }

  for (const pin of pins) {
    const url = extractImageUrl(pin);
    if (!url) continue;

    imageQueue.push({
      url,
      pinUrl: pin.id ? `https://www.pinterest.com/pin/${pin.id}/` : null,
    });
  }
}

/**
 * Returns a random image from the queue, refilling it first if it
 * has fewer than MIN_QUEUE_SIZE entries.
 * @returns {Promise<{ url: string, pinUrl: string|null }>}
 */
async function getRandomImage() {
  if (imageQueue.length < MIN_QUEUE_SIZE) {
    await refillQueue();
  }

  if (imageQueue.length === 0) {
    throw new Error('Image queue is empty after refill attempt.');
  }

  const index = Math.floor(Math.random() * imageQueue.length);
  const [image] = imageQueue.splice(index, 1);
  return image;
}

module.exports = { getRandomImage };
