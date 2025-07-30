const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('corp')
    .setDescription('Send corporate DMs to all server members (Admin only)'),
  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ You need admin permissions to use this command.', ephemeral: true });
    }

    const members = await interaction.guild.members.fetch();
    let sentCount = 0;

    for (const [id, member] of members) {
      if (member.user.bot) continue;
      try {
        await member.send('📢 This is a corporate message from your server.');
        sentCount++;
      } catch (error) {
        console.error(`Failed to DM ${member.user.tag}:`, error.message);
      }
    }

    await interaction.reply(`✅ Sent corporate message to ${sentCount} members.`);
  }
};
