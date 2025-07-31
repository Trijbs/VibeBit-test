const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const channelName = '👋welcome';
    let welcomeChannel = member.guild.channels.cache.find(
      (ch) => ch.name === channelName && ch.type === 0 // 0 = GUILD_TEXT
    );

    if (!welcomeChannel) {
      try {
        welcomeChannel = await member.guild.channels.create({
          name: channelName,
          type: 0,
          topic: 'This channel is dedicated to welcome new members!',
          permissionOverwrites: [
            {
              id: member.guild.roles.everyone,
              allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
            },
          ],
        });
      } catch (err) {
        console.error('Failed to create welcome channel:', err);
        welcomeChannel = member.guild.channels.cache.get('1400279407247229110');
        if (!welcomeChannel) return;
      }
    }

    const welcomeMsg = `🎉 Welcome <@${member.user.id}> to **${member.guild.name}**!\nWe're glad to have you here. Feel free to introduce yourself!`;

    try {
      await welcomeChannel.send({ content: welcomeMsg });
    } catch (err) {
      console.error('Failed to send welcome message:', err);
    }

    const dataToSave = {
      id: member.id,
      tag: member.user.tag,
      joinedAt: member.joinedAt.toISOString(),
      createdAt: member.user.createdAt.toISOString(),
    };

    const filePath = path.join(__dirname, '..', 'data', 'members.json');
    try {
      let data = [];
      if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      data.push(dataToSave);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error writing member data:', err);
    }

    // Attempt to assign the "᭼ Fusionist" role to the new member
    const fusionistRole = member.guild.roles.cache.find(role => role.name === '᭼ Fusionist');
    if (fusionistRole) {
      try {
        await member.roles.add(fusionistRole);
      } catch (err) {
        console.error(`Failed to assign Fusionist role to ${member.user.tag}:`, err);
      }
    }
  },
};