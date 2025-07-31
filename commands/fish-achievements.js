const { SlashCommandBuilder } = require('discord.js');
const { getUserData } = require('../data/fish_data.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fish-achievements')
    .setDescription('🎖️ View your fishing achievements!')
    .setDMPermission(true),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    await interaction.deferReply({ flags: 1 << 6 });

    const userData = getUserData(guildId, userId);

    if (!userData) {
      await interaction.editReply({ content: "You haven't caught any fish yet!" });
      return;
    }

    const achievements = userData.achievements || [];
    if (achievements.length === 0) {
      await interaction.editReply({ content: "You don't have any achievements yet!" });
      return;
    }

    const achievementList = achievements.map(a => `🏆 ${a}`).join('\n');

    await interaction.editReply({ content: `Here are your achievements:\n${achievementList}` });
  }
};