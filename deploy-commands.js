const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { token, clientId, guildId } = require('./config.json');

const commands = [];

// Read commands from ./commands/
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const commandPath = path.join(__dirname, 'commands', file);
    const commandModule = require(commandPath);
    if (!commandModule) {
      console.warn(`⚠️ Skipping ${file}: module.exports is undefined or null`);
      continue;
    }

    if (Array.isArray(commandModule.data) && commandModule.data.length > 0) {
      commandModule.data.forEach((cmd, index) => {
        if (cmd?.name && cmd?.description) {
          commands.push(new SlashCommandBuilder()
            .setName(cmd.name)
            .setDescription(cmd.description)
            .toJSON());
          console.log(`✅ Registered [${cmd.name}] from ${file}[${index}]`);
        } else {
          console.warn(`⚠️ Invalid command in ${file}[${index}]: Missing name or description`);
        }
      });
    } else if (!commandModule.data) {
      console.warn(`⚠️ Skipping ${file}: "data" is missing or undefined`);
    } else if (commandModule.data && commandModule.data.name && commandModule.data.description) {
      commands.push(new SlashCommandBuilder()
        .setName(commandModule.data.name)
        .setDescription(commandModule.data.description)
        .toJSON());
      console.log(`✅ Registered [${commandModule.data.name}] from ${file}`);
    } else {
      console.warn(`⚠️ The command at ${file} is missing "data.name" or "data.description".`);
    }

  } catch (err) {
    console.error(`❌ Failed to load command at ${file}: ${err.message}`);
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('⏳ Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('✅ Slash commands registered.');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();