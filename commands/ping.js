const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply({ content: 'Pong!' });
    } catch (error) {
      console.error('Error handling /ping command:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Something went wrong while processing your command.', flags: 64 });
      }
    }
  },
};
