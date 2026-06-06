const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { getRandomImage } = require('./scraper');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

const MEME_INTERVAL_MS = 3000;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  const channelId = process.env.MEME_CHANNEL_ID;
  if (!channelId) {
    console.error('Missing MEME_CHANNEL_ID environment variable.');
    process.exit(1);
  }

  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.error(`Channel ${channelId} not found. Make sure the bot has access to it.`);
    process.exit(1);
  }

  console.log(`Auto-posting memes to #${channel.name} every ${MEME_INTERVAL_MS / 1000}s`);

  setInterval(async () => {
    try {
      const randomImage = await getRandomImage();

      const embed = new EmbedBuilder()
        .setColor(0xe60023) // Pinterest red
        .setTitle('🖼️ Random Meme')
        .setImage(randomImage.url)
        .setURL(randomImage.pinUrl || randomImage.url)
        .setFooter({ text: 'Fetched from Pinterest' })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('Error fetching or posting meme:', err);
    }
  }, MEME_INTERVAL_MS);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN environment variable.');
  process.exit(1);
}

client.login(token);

