const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls a random number between 1 and 100'),
  async execute(interaction) {
    try {
      if (!interaction || typeof interaction.reply !== 'function') {
        console.error('Invalid interaction object.');
        return;
      }

      const roll = Math.floor(Math.random() * 100) + 1;
      await interaction.reply(`🎲 You rolled a **${roll}**!`);
    } catch (error) {
      console.error('Error executing /roll command:', error);
      if (interaction && interaction.reply) {
        await interaction.reply({ content: '❌ Something went wrong while rolling the dice.', flags: 64 });
      }
    }
  },
};
