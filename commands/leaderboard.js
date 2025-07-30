const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show top trivia players'),
  async execute(interaction) {
    await interaction.deferReply({ flags: 1 << 6 });

    const data = require('../leaderboard.json');
    const sorted = Object.entries(data)
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 10);

    if (sorted.length === 0) {
      await interaction.editReply('📭 No leaderboard data.');
      return;
    }

    const lines = sorted.map(([id, info], i) => `**${i + 1}.** <@${id}> — ${info.score}`);
    await interaction.editReply(lines.join('\n'));
  },
};
