

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-welcome')
    .setDescription('🔧 Create the dedicated welcome channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channelName = '👋welcome';

    const existing = interaction.guild.channels.cache.find(ch => ch.name === channelName);
    if (existing) {
      return interaction.editReply('⚠️ Welcome channel already exists.');
    }

    try {
      await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: 'This channel is dedicated to welcome new members!',
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
        ],
      });

      await interaction.editReply('✅ Welcome channel created.');
    } catch (error) {
      console.error('Failed to create welcome channel:', error);
      await interaction.editReply('❌ Failed to create channel.');
    }
  }
};