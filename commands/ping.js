const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
    .setDMPermission(true),

  async execute(interaction) {
    try {
      const sent = await interaction.editReply({ content: 'Pinging...' });
      const pingTime = sent.createdTimestamp - interaction.createdTimestamp;
      await interaction.editReply({ content: `🏓 Pong! (Roundtrip: ${pingTime}ms)` });
    } catch (error) {
      console.error('Error in /ping:', error);
      if (!interaction.replied) {
        try {
          await interaction.editReply({ content: '❌ Failed to respond to ping command.' });
        } catch (err) {
          console.error('Error editing reply in /ping fallback:', err);
        }
      }
    }
  },
};
