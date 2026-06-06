const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { fetchMemeImages } = require('./scraper');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content.trim().toLowerCase() !== '!meme') return;

  try {
    const images = await fetchMemeImages();

    if (!images || images.length === 0) {
      return message.reply('Could not find any memes right now. Try again later!');
    }

    const randomImage = images[Math.floor(Math.random() * images.length)];

    const embed = new EmbedBuilder()
      .setColor(0xe60023) // Pinterest red
      .setTitle('🖼️ Random Meme')
      .setImage(randomImage.url)
      .setURL(randomImage.pinUrl || randomImage.url)
      .setFooter({ text: 'Fetched from Pinterest' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (err) {
    console.error('Error fetching meme:', err);
    message.reply('Something went wrong while fetching a meme. Please try again!');
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN environment variable.');
  process.exit(1);
}

client.login(token);

