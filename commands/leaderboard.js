const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = './data/trivia_data.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows the top trivia scores'),

  async execute(interaction) {
    try {
      let leaderboard = {};
      if (fs.existsSync(path)) {
        leaderboard = JSON.parse(fs.readFileSync(path, 'utf8'));
      }

      const sorted = Object.entries(leaderboard)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([user, score], i) => `#${i + 1} <@${user}> - ${score} pts`)
        .join('\n');

      await interaction.reply({
        content: sorted
          ? `🏆 Trivia Leaderboard:\n${sorted}`
          : 'The leaderboard is currently empty.',
        flags: 0 // avoid deprecated `ephemeral` warning
      });
    } catch (error) {
      console.error('Error reading leaderboard:', error);
      await interaction.reply({
        content: '⚠️ Failed to load the leaderboard.',
        flags: 0
      });
    }
  }
};
