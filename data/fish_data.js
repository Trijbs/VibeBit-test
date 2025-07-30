const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'fish_data.json');

function ensureData() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({}));
  }
}

function readData() {
  ensureData();
  const raw = fs.readFileSync(dataFilePath);
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

function getUserData(guildId, userId) {
  const data = readData();
  return data[guildId]?.[userId] || null;
}

function updateUserData(guildId, userId, update) {
  const data = readData();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) data[guildId][userId] = {};
  data[guildId][userId] = { ...data[guildId][userId], ...update };
  writeData(data);
}

module.exports = {
  getUserData,
  updateUserData,
};