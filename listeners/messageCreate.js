const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Je bent een moderatorbot. Label alleen berichten als ongepast als ze beledigend, gewelddadig of haatdragend zijn. Antwoord alleen met "ongepast" of "ok".'
          },
          { role: 'user', content: message.content }
        ],
        max_tokens: 1
      });

      const result = response.choices[0].message.content.toLowerCase().trim();
      if (result === 'ongepast') {
        await message.reply('⚠️ Dit bericht kan in strijd zijn met de richtlijnen.');
        return;
      }
    } catch (err) {
      console.warn('AI moderatie mislukt:', err.message);
    }

    const lower = message.content.toLowerCase();

    if (message.channel.type === 1) {
      await message.channel.send(`👋 Hi ${message.author.username}, I'm your friendly bot!`);
      return;
    }

    if (message.channel.isThread() && lower.includes('gpt')) {
      await message.channel.send(`🧠 I'm listening...`);
      return;
    }

    if (lower.includes('bot help')) {
      await message.reply('🤖 Need help? Try using `/commands` or `/ping`!');
    }

    if (lower.includes('fish') || lower.includes('catch')) {
      await message.react('🎣');
    }
  }
};