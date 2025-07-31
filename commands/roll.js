const { SlashCommandBuilder, InteractionFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls a random number between 1 and 100')
    .setDMPermission(true),
    
  async execute(interaction) {
    try {
      if (!interaction || typeof interaction.deferReply !== 'function' || typeof interaction.editReply !== 'function') {
        console.error('Invalid interaction object.');
        return;
      }

      await interaction.deferReply({ flags: InteractionFlags.Ephemeral });

      const roll = Math.floor(Math.random() * 100) + 1;
      await interaction.editReply(`🎲 You rolled a **${roll}**!`);
    } catch (error) {
      console.error('Error executing /roll command:', error);
      if (interaction && interaction.editReply) {
        await interaction.followUp({ content: '❌ Something went wrong while rolling the dice.', flags: InteractionFlags.Ephemeral });
      }
    }
  },
};
