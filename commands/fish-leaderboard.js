const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function ensureUserEntry(data, guildId, userId) {
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) {
    data[guildId][userId] = {
      xp: 0,
      streak: 0,
      achievements: [],
      catches: {}
    };
  }
  return data[guildId][userId];
}

const command = {
  data: new SlashCommandBuilder()
    .setName('fish-leaderboard')
    .setDescription('🎣 Shows the top fishing players based on XP.'),

  async execute(interaction) {
    const dataPath = path.join(__dirname, '../data/fish_xp.json');

    let fishData = {};
    try {
      fishData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (err) {
      console.error('❌ Failed to read fish XP data:', err);
      const embed = { content: '⚠️ Failed to load leaderboard data.', flags: 64 };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(embed);
      } else {
        await interaction.reply(embed);
      }
      return;
    }

    const guildId = interaction.guildId;
    if (!fishData[guildId]) fishData[guildId] = {};

    const sorted = Object.entries(fishData[guildId])
      .sort(([, a], [, b]) => b.xp - a.xp)
      .slice(0, 10);

    if (sorted.length === 0) {
      const embed = { content: '📭 No fishing data available yet.', flags: 64 };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(embed);
      } else {
        await interaction.reply(embed);
      }
      return;
    }

    const leaderboard = sorted
      .map(([userId]) => {
        const userEntry = ensureUserEntry(fishData, guildId, userId);
        return `**${sorted.indexOf([userId, userEntry]) + 1}.** <@${userId}> — ${userEntry.xp} XP`;
      })
      .join('\n');

    const embed = {
      content: `🎣 **Top Fishing Leaderboard**\n\n${leaderboard}`,
      allowedMentions: { users: [] },
      flags: 64
    };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(embed);
    } else {
      await interaction.reply(embed);
    }
  }
};

module.exports = command;