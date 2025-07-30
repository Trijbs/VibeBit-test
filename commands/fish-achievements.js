const { SlashCommandBuilder } = require('discord.js');
const { getUserData } = require('../data/fish_data.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fish-achievements')
    .setDescription('🎖️ View your fishing achievements!'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    const userData = getUserData(guildId, userId);

    if (!userData) {
      await interaction.deferReply({ flags: 64 });
      await interaction.editReply("You haven't caught any fish yet!");
      return;
    }

    const achievements = userData.achievements || [];
    if (achievements.length === 0) {
      await interaction.deferReply({ flags: 64 });
      await interaction.editReply("You don't have any achievements yet!");
      return;
    }

    const achievementList = achievements.map(a => `🏆 ${a}`).join('\n');

    await interaction.deferReply({ flags: 64 });
    await interaction.editReply(`Here are your achievements:\n${achievementList}`);
  }
};