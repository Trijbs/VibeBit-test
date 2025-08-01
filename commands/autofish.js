// autoFish.js
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

async function main() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.commands = new Collection();

  const commandsDir = path.join(__dirname);
  const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js') && file !== 'autofish.js');
  for (const file of commandFiles) {
    const command = require(path.join(commandsDir, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }

  client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const GUILD_ID = '1390512546858926163';
    const USER_ID = '1400140375930441758';

    const fishCommand = client.commands.get('fish');
    if (!fishCommand) {
      console.error('❌ /fish command not loaded.');
      return;
    }

    setInterval(async () => {
      try {
        const guild = client.guilds.cache.get(GUILD_ID);
        const member = await guild.members.fetch(USER_ID);
        const interactionMock = {
          guild,
          user: member.user,
          guildId: guild.id,
          deferReply: () => Promise.resolve(),
          editReply: (msg) => {
            console.log('Fish result:', msg.content || msg);
            return Promise.resolve();
          },
          replied: false,
          deferred: false
        };
        // Trigger the /fish command
        await fishCommand.execute(interactionMock);
      } catch (err) {
        console.error('❌ Error triggering /fish:', err);
      }
    }, 10000); // Every 10 seconds
  });

  await client.login(process.env.DISCORD_TOKEN);
}

main();