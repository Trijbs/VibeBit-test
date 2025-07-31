const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    await interaction.deferReply({ flags: 1 << 6 });
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
