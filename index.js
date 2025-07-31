require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const fs = require('fs');
const { Client, GatewayIntentBits, Collection, InteractionType } = require('discord.js');
const logErrorToChannel = require('./lib/logErrorToChannel.js');
const token = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  try {
    const commandModule = require(`./commands/${file}`);
    console.log(`📦 Loaded module from ${file}:`, commandModule);

    if (
      typeof commandModule === 'object' &&
      commandModule.data &&
      (typeof commandModule.data.name === 'string' || typeof commandModule.data.name === 'function') &&
      typeof commandModule.execute === 'function'
    ) {
      client.commands.set(commandModule.data.name, commandModule);
      console.log(`✅ Registered command: ${commandModule.data.name} from ${file}`);
    } else {
      console.warn(`⚠️ Skipping ${file}: missing data or execute or data.name`);
    }
  } catch (err) {
    console.error(`❌ Failed to load commands from ${file}:`, err);
  }
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const statuses = [
    { name: '⛔️ Testing Shit', type: 0 },
    { name: '🧠 Enhancing', type: 0 },
    { name: '📊 leaderboard', type: 3 },
    { name: '⚡ Use /fish or /trivia', type: 0 }
  ];

  let index = 0;
  setInterval(() => {
    client.user.setPresence({
      activities: [statuses[index]],
      status: 'online',
    });
    index = (index + 1) % statuses.length;
  }, 15000); // rotates every 15 seconds
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // 64 is the value for ephemeral flag in Discord API
  const EPHEMERAL_FLAG = 64;

  try {
    // Defer reply to prevent early timeout or unknown interaction errors
    await interaction.deferReply({ flags: EPHEMERAL_FLAG });

    // Only skip execution if a reply has already been sent
    if (interaction.replied) return;

    await command.execute(interaction);
  } catch (error) {
    console.error(`Error handling /${interaction.commandName} command:`, error);
    await logErrorToChannel(client, `❌ Error in /${interaction.commandName}:\n${error.stack || error.message}`);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ There was an error executing this command.',
          flags: EPHEMERAL_FLAG
        });
      } else {
        console.error('❌ Failed to send error response: Interaction already acknowledged.');
      }
    } catch (err) {
      console.error('❌ Failed to send error response: Interaction already acknowledged.');
      await logErrorToChannel(client, `❌ Failed to send error reply:\n${err.stack || err.message}`);
    }
  }
});

const messageHandler = require('./listeners/messageCreate');
client.on('messageCreate', msg => messageHandler.execute(msg, client));

client.login(token);
