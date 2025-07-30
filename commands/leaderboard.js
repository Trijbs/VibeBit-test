const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    await interaction.deferReply({ flags: 1 << 6 }); // Ephemeral using flags
    await interaction.editReply('🏓 Pong!');
  },
};
