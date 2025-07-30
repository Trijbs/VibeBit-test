require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
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
    { name: '📊 Checking leaderboard', type: 3 },
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

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ There was an error executing this command.', flags: 1 << 6 });
  }
});

client.login(token);
