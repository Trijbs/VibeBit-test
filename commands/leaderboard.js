const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show top trivia players'),

  async execute(interaction) {
    await interaction.deferReply({ flags: 1 << 6 });

    const dataPath = path.join(__dirname, '..', 'leaderboard.json');
    let data = {};
    try {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (err) {
      console.error('Failed to read leaderboard data:', err);
      await interaction.editReply('⚠️ Failed to load leaderboard.');
      return;
    }

    const data = require('../leaderboard.json');
    const sorted = Object.entries(data)
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 10);

    if (sorted.length === 0) {
      await interaction.editReply('📭 Leaderboard is empty.');
      return;
    }

    const board = sorted
      .map(([id, entry], i) => `**${i + 1}.** <@${id}> — ${entry.score}`)
      .join('\n');

    await interaction.editReply({
      content: `📊 **Leaderboard**\n\n${board}`,
      allowedMentions: { users: [] }
    });
      await interaction.editReply('📭 No leaderboard data.');
      return;
    }

    const lines = sorted.map(([id, info], i) => `**${i + 1}.** <@${id}> — ${info.score}`);
    await interaction.editReply(lines.join('\n'));
  },
};
