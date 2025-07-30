const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { updateLeaderboard } = require('../lib/db.js');
const triviaData = require('../data/trivia_data.js');
const fs = require('fs');
const path = require('path');

function decode(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&eacute;/g, 'é');
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

const baseQuestions = [
  {
    question: 'What gas do plants absorb from the atmosphere?',
    correct_answer: 'Carbon dioxide',
    incorrect_answers: ['Oxygen', 'Nitrogen', 'Hydrogen'],
  },
  {
    question: 'Which planet is the hottest in our solar system?',
    correct_answer: 'Venus',
    incorrect_answers: ['Mercury', 'Mars', 'Jupiter'],
  },
  {
    question: 'What is the chemical symbol for water?',
    correct_answer: 'H2O',
    incorrect_answers: ['HO2', 'O2', 'HHO'],
  },
  {
    question: 'Who was the first president of the United States?',
    correct_answer: 'George Washington',
    incorrect_answers: ['Thomas Jefferson', 'John Adams', 'Abraham Lincoln'],
  },
  {
    question: 'In what year did World War II end?',
    correct_answer: '1945',
    incorrect_answers: ['1939', '1942', '1950'],
  },
  {
    question: 'What is the name of our galaxy?',
    correct_answer: 'Milky Way',
    incorrect_answers: ['Andromeda', 'Black Hole', 'Orion'],
  },
  {
    question: 'What is the capital of France?',
    correct_answer: 'Paris',
    incorrect_answers: ['Lyon', 'Marseille', 'Toulouse'],
  },
  {
    question: 'What is the largest mammal?',
    correct_answer: 'Blue Whale',
    incorrect_answers: ['Elephant', 'Giraffe', 'Hippopotamus'],
  },
  {
    question: 'How many continents are there?',
    correct_answer: '7',
    incorrect_answers: ['5', '6', '8'],
  },
  {
    question: 'What year did the Titanic sink?',
    correct_answer: '1912',
    incorrect_answers: ['1910', '1914', '1920'],
  },
  {
    question: 'Which metal has the chemical symbol Fe?',
    correct_answer: 'Iron',
    incorrect_answers: ['Copper', 'Silver', 'Zinc'],
  },
];

const fallbackQuestions = Array.from({ length: 100 }, (_, i) => {
  const base = baseQuestions[i % baseQuestions.length];
  return {
    question: decode(base.question),
    correct_answer: decode(base.correct_answer),
    incorrect_answers: base.incorrect_answers.map(decode),
  };
});

const data = new SlashCommandBuilder()
  .setName('trivia')
  .setDescription('Play a trivia game with category and difficulty selection.');

async function execute(interaction) {
  const categoryRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('scientific').setLabel('Scientific').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('history').setLabel('History').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('genz').setLabel('Gen Z').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('boomer').setLabel('Boomer').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('trending').setLabel('Trending').setStyle(ButtonStyle.Secondary),
  );

  const difficultyRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('easy').setLabel('Easy').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('medium').setLabel('Medium').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('hard').setLabel('Hard').setStyle(ButtonStyle.Success),
  );

  await interaction.reply({
    content: '🎯 Choose a category and difficulty to start!',
    components: [categoryRow, difficultyRow],
  });

  const filter = i => i.user.id === interaction.user.id;
  let selectedCategory = null;
  let selectedDifficulty = null;

  const collector = interaction.channel.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 30000,
  });

  collector.on('collect', async i => {
    if (i.user.id !== interaction.user.id) return i.reply({ content: 'This menu is not for you.', ephemeral: true });

    if (!selectedCategory && ['scientific', 'history', 'genz', 'boomer', 'trending'].includes(i.customId)) {
      selectedCategory = i.customId;
      await i.reply({ content: `📚 Category selected: **${selectedCategory}**`, ephemeral: true });
    } else if (!selectedDifficulty && ['easy', 'medium', 'hard'].includes(i.customId)) {
      selectedDifficulty = i.customId;
      await i.reply({ content: `🎚️ Difficulty selected: **${selectedDifficulty}**`, ephemeral: true });
    }

    if (selectedCategory && selectedDifficulty) {
      collector.stop('both-selected');
    }
  });

  collector.on('end', async (collected, reason) => {
    if (reason !== 'both-selected') {
      return interaction.followUp('⏰ Selection timed out. Please try again.');
    }

    let opentdbCategory = null;
    if (selectedCategory === 'scientific') opentdbCategory = 17;
    if (selectedCategory === 'history') opentdbCategory = 23;

    if (opentdbCategory) {
      const url = `https://opentdb.com/api.php?amount=1&type=multiple&category=${opentdbCategory}&difficulty=${selectedDifficulty}`;
      await interaction.followUp({ content: '📡 Fetching trivia question...' });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      let q;
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        const json = await res.json();
        q = json.results[0];
      } catch (error) {
        clearTimeout(timeout);
        q = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      }

      const correct = decode(q.correct_answer);
      const options = shuffle([...q.incorrect_answers.map(decode), correct]);
      const questionText = decode(q.question);

      const optionsRow = new ActionRowBuilder().addComponents(
        ...options.map((opt, i) =>
          new ButtonBuilder()
            .setCustomId(`answer_${i}`)
            .setLabel(String.fromCharCode(65 + i))
            .setStyle(ButtonStyle.Secondary)
        )
      );

      const correctIndex = options.findIndex(opt => opt === correct);

      await interaction.followUp({
        content: `**${questionText}**\n\n${options.map((opt, i) => `**${String.fromCharCode(65 + i)}.** ${opt}`).join('\n')}`,
        components: [optionsRow],
      });

      const answerCollector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
      });

      answerCollector.on('collect', async btn => {
        if (btn.user.id !== interaction.user.id) return btn.reply({ content: 'Not your question!', ephemeral: true });
        answerCollector.stop();
        if (!triviaData[btn.user.id]) {
          triviaData[btn.user.id] = { correct: 0, incorrect: 0 };
        }
        if (btn.customId === `answer_${correctIndex}`) {
          triviaData[btn.user.id].correct += 1;
        } else {
          triviaData[btn.user.id].incorrect += 1;
        }
        const triviaPath = require('path').join(__dirname, '../data/trivia_data.js');
        fs.writeFileSync(triviaPath, 'module.exports = ' + JSON.stringify(triviaData, null, 2));
        // XP store logic
        const xpPath = path.join(__dirname, '../data/trivia_xp.json');
        let xpData = {};
        if (fs.existsSync(xpPath)) {
          xpData = JSON.parse(fs.readFileSync(xpPath, 'utf-8'));
        }
        const userId = btn.user.id;
        if (!xpData[userId]) xpData[userId] = 0;
        if (btn.customId === `answer_${correctIndex}`) {
          xpData[userId] += 1;
          fs.writeFileSync(xpPath, JSON.stringify(xpData, null, 2));
        }
        if (btn.customId === `answer_${correctIndex}`) {
          updateLeaderboard(btn.user);
          await btn.reply('✅ Correct! +1 point added.');
        } else {
          await btn.reply(`❌ Wrong! Correct answer was **${String.fromCharCode(65 + correctIndex)}**`);
        }
      });

      answerCollector.on('end', async (_, reason) => {
        if (reason === 'time') {
          await interaction.followUp('⏰ Time ran out for answering!');
        }
      });
    } else {
      await interaction.followUp(`❗ The category **${selectedCategory}** is not yet supported.`);
    }
  });
}

module.exports = { data, execute };