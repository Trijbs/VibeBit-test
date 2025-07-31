const { SlashCommandBuilder } = require('discord.js');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask something to GPT')
    .setDMPermission(true), // ✅ belangrijk

        
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const input = interaction.options.getString('prompt');

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: input }],
      });

      const reply = chatCompletion.choices[0].message.content;
      await interaction.editReply({ content: reply });
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      await interaction.editReply({ content: '❌ Failed to get a response from OpenAI.' });
    }
  },
};