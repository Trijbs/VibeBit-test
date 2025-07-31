const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (
    command &&
    typeof command === 'object' &&
    'data' in command &&
    'execute' in command &&
    command.data?.name &&
    command.data?.description
  ) {
    try {
      if (commands.find(c => c.name === command.data.name)) {
        console.warn(`⚠️ Duplicate command skipped: ${command.data.name}`);
        continue;
      }
      commands.push(command.data.toJSON());
      console.log(`✅ Registered [${command.data.name}] from ${file}`);
    } catch (err) {
      console.error(`❌ Failed to register command from ${file}:`, err);
    }
  } else {
    console.warn(`⚠️ Skipping invalid command in ${file}: missing "data" or "execute" export`);
  }
}


(async () => {
  try {
    console.log('⏳ Registering slash commands...');
    const rest = new REST().setToken(token);
    const route = guildId
      ? Routes.applicationGuildCommands(clientId, guildId)
      : Routes.applicationCommands(clientId);

    await rest.put(route, { body: commands });
    console.log('✅ Slash commands registered.');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();