const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];
const registeredNames = new Set();

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
      const name = command.data.name;
      if (registeredNames.has(name)) {
        console.warn(`⚠️ Duplicate command skipped: ${name}`);
        continue;
      }
      registeredNames.add(name);
      commands.push(command.data.toJSON());
      console.log(`✅ Registered [${name}] from ${file}`);
    } catch (err) {
      console.error(`❌ Failed to register command from ${file}:`, err);
    }
  } else {
    console.warn(`⚠️ Skipping invalid command in ${file}: missing "data" or "execute" export`);
  }
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
