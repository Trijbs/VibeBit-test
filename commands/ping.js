const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  execute: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply('🏓 Pong!');
    } catch (error) {
      console.error("Error handling /ping command:", error);
      if (!interaction.replied) {
        await interaction.editReply('❌ Er ging iets mis bij /ping.');
      }
    }
  }
};
