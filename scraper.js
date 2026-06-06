const https = require("https");
const PINTEREST_TOKEN = process.env.PINTEREST_TOKEN;
const SEARCH_QUERIES = [
 "funny memes",
 "dank memes",
 "relatable memes",
 "cursed memes",
 "comedy memes",
 "viral memes",
 "humor memes",
 "lol memes",
 "meme faces",
 "reaction memes",
];
let imageQueue = [];
let queryIndex = 0;
function fetchPinterestImages(query) {
 return new Promise((resolve) => {
 const options = {
 hostname: "api.pinterest.com",
 path: "/v5/pins/search?query=" + encodeURIComponent(query) + "&page_size=50",
 method: "GET",
 headers: {
 "Authorization": "Bearer " + PINTEREST_TOKEN,
 "Content-Type": "application/json",
 },
 };
 const req = https.request(options, (res) => {
 let data = "";
 res.on("data", (chunk) => (data += chunk));
 res.on("end", () => {
 console.log("Pinterest status: " + res.statusCode);
 console.log("Pinterest response preview: " + data.slice(0, 500));
 try {
 const json = JSON.parse(data);
 const urls = [];
 const items = json.items || [];
 for (const pin of items) {
 const media = pin.media;
 if (media && media.images) {
 const img =
 media.images["1200x"] ||
 media.images["736x"] ||
 media.images["600x"] ||
 media.images["400x"];
 if (img && img.url) urls.push(img.url);
 }
 }
 console.log("Found " + urls.length + " images");
 resolve(urls);
 } catch (e) {
 console.error("Parse error: " + e.message);
 resolve([]);
 }
 });
 });
 req.on("error", (e) => {
 console.error("Request error: " + e.message);
 resolve([]);
 });
 req.setTimeout(10000, () => {
 req.destroy();
 resolve([]);
 });
 req.end();
 });
}
async function refillQueue() {
 const query = SEARCH_QUERIES[queryIndex % SEARCH_QUERIES.length];
 queryIndex++;
 console.log("Searching Pinterest for: " + query);
 const images = await fetchPinterestImages(query);
 if (images.length > 0) {
 imageQueue.push(...images.sort(() => Math.random() - 0.5));
 console.log("Added " + images.length + " images (total: " + imageQueue.length + ")");
 } else {
 console.warn("No images found for: " + query);
 }
}
async function getRandomImage() {
 if (imageQueue.length < 10) await refillQueue();
 if (imageQueue.length === 0) {
 console.warn("Queue empty.");
 return null;
 }
 return imageQueue.shift();
}
module.exports = { getRandomImage };

