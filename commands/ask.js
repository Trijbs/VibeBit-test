const { SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask a question to OpenAI')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('Your prompt for GPT')
        .setRequired(true)),

  async execute(interaction) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // ✅ alleen hier gebruiken

    const input = interaction.options.getString('prompt');

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: input }],
      });

      const reply = response.choices[0].message.content;
      await interaction.editReply({ content: reply });
    } catch (err) {
      console.error('GPT error:', err);
      await interaction.editReply({ content: '❌ Failed to get response from OpenAI.' });
    }
  },
};