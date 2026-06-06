const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { getRandomImage } = require("./scraper");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.once("ready", () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!meme") {
    try {
      await message.channel.sendTyping();
      const imageUrl = await getRandomImage();

      if (!imageUrl) {
        return message.reply("❌ Could not fetch a meme. Try again later.");
      }

      const embed = new EmbedBuilder()
        .setImage(imageUrl)
        .setColor("#FF1493")
        .setFooter({ text: "Powered by Pinterest" });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching meme:", error);
      message.reply("❌ Something went wrong. Try again later.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

