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
      return interaction.reply({ content: "You haven't caught any fish yet!", ephemeral: true });
    }

    const achievements = userData.achievements || [];
    if (achievements.length === 0) {
      return interaction.reply({ content: "You don't have any achievements yet!", ephemeral: true });
    }

    const achievementList = achievements.map(a => `🏆 ${a}`).join('\n');

    await interaction.reply({
      content: `Here are your achievements:\n${achievementList}`,
      ephemeral: true
    });
  }
};