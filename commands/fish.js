const { loadXPData, saveXPData } = require('../data/fish_xp.js');
const { SlashCommandBuilder } = require('discord.js');
const {
  loadFishData,
  saveFishData,
  getOrInitUserData
} = require('../data/fish_data.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fish')
    .setDescription('Catch a fish and earn XP!')
    .setDMPermission(true),

  async execute(interaction) {

    const fishData = loadFishData();
    const xpData = loadXPData();
    const userData = getOrInitUserData(interaction.guild.id, interaction.user.id);
    const now = Date.now();
    try {
      if (userData.lastFish && now - userData.lastFish < 10000) {
        const timeLeft = ((10000 - (now - userData.lastFish)) / 1000).toFixed(1);
        await interaction.editReply({ content: `⏳ Wait ${timeLeft}s before fishing again.` });
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 5000));

      const noCatchChance = Math.random();
      if (noCatchChance < 0.1) { // 10% chance to catch nothing
        userData.streak = 0;
        userData.lastFish = now;
        userData.lastCaught = null;
        fishData[interaction.guild.id][interaction.user.id] = userData;
        saveFishData(fishData);
        await interaction.editReply({ content: '😞 You didn’t catch anything this time.' });
        return;
      }

      const chance = Math.random() * 100;
      let fishType = null;
      let xpGain = 5;

      if (chance < 2) fishType = '🐙 Golden Kraken';
      else if (chance < 32) fishType = '🐬 Dolphin';
      else if (chance < 57) fishType = '🐡 Pufferfish';
      else if (chance < 82) fishType = '👟 Trash Shoe';
      else if (chance < 100) fishType = '🐟 Common Fish';

      if (userData.lastCaught === fishType) {
        userData.streak++;
      } else {
        userData.streak = 1;
      }

      const bonus = userData.streak >= 5 ? userData.streak : 0;
      xpGain += bonus;

      userData.xp += xpGain;
      if (!xpData[interaction.guild.id]) xpData[interaction.guild.id] = {};
      if (!xpData[interaction.guild.id][interaction.user.id]) xpData[interaction.guild.id][interaction.user.id] = 0;
      xpData[interaction.guild.id][interaction.user.id] += xpGain;
      saveXPData(xpData);
      userData.lastFish = now;
      userData.lastCaught = fishType;
      userData.username = interaction.user.username;

      const unlocked = [];
      if (userData.xp >= 100 && !userData.achievements.includes('Beginner Angler')) {
        userData.achievements.push('Beginner Angler');
        unlocked.push('🏅 **Beginner Angler** (100 XP)');
      }
      if (userData.streak >= 10 && !userData.achievements.includes('Fish Streaker')) {
        userData.achievements.push('Fish Streaker');
        unlocked.push('🔥 **Fish Streaker** (10x streak)');
      }

      fishData[interaction.guild.id][interaction.user.id] = userData;
      saveFishData(fishData);

      let reply = `🎣 You caught a ${fishType} and earned **${xpGain} XP**!\n🔥 Streak: ${userData.streak}`;
      if (bonus > 0) reply += ` (+${bonus} bonus XP)`;
      if (unlocked.length) reply += `\n\n🎉 You unlocked:\n${unlocked.join('\n')}`;

      // Edit the original reply to avoid duplicate/conflicting replies
      await interaction.editReply({ content: reply });
    } catch (err) {
      try {
        await interaction.editReply({ content: '❌ An error occurred while fishing.' });
      } catch (err2) {
        console.warn('Failed to edit reply:', err2.message);
      }
    }
  }
};

// Ensure command metadata is present for command loader compatibility
if (
  !module.exports.data ||
  typeof module.exports.data.name !== 'string' ||
  typeof module.exports.data.description !== 'string'
) {
  console.warn('⚠️ fish.js is missing required command metadata');
}