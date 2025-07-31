const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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

const fs = require('fs');
const path = require('path');
const leaderboardFile = path.join(__dirname, '../leaderboard.json');

function updateLeaderboard(user, increment = 1) {
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(leaderboardFile, 'utf8'));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }

  const id = user.id;
  if (!data[id]) {
    data[id] = { username: user.username, score: 0 };
  }

  data[id].score += increment;
  fs.writeFileSync(leaderboardFile, JSON.stringify(data, null, 2));
}

module.exports = {
  decode,
  shuffle,
  updateLeaderboard
};
