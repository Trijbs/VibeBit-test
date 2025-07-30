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
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: "You haven't caught any fish yet!", flags: 64 });
      } else {
        await interaction.reply({ content: "You haven't caught any fish yet!", flags: 64 });
      }
      return;
    }

    const achievements = userData.achievements || [];
    if (achievements.length === 0) {
      await interaction.deferReply({ flags: 64 });
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: "You don't have any achievements yet!", flags: 64 });
      } else {
        await interaction.reply({ content: "You don't have any achievements yet!", flags: 64 });
      }
      return;
    }

    const achievementList = achievements.map(a => `🏆 ${a}`).join('\n');

    await interaction.deferReply({ flags: 64 });
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: `Here are your achievements:\n${achievementList}`, flags: 64 });
    } else {
      await interaction.reply({ content: `Here are your achievements:\n${achievementList}`, flags: 64 });
    }
  }
};