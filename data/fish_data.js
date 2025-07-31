const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'fish_data.json');

function loadFishData() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveFishData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getUserData(guildId, userId) {
  const data = loadFishData();
  return data[guildId]?.[userId] || null;
}

function getOrInitUserData(guildId, userId) {
  const data = loadFishData();
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][userId]) {
    data[guildId][userId] = {
      xp: 0,
      streak: 0,
      inventory: [],
      achievements: []
    };
    saveFishData(data);
  }
  return data[guildId][userId];
}

function setUserData(guildId, userId, userData) {
  const data = loadFishData();
  if (!data[guildId]) data[guildId] = {};
  data[guildId][userId] = userData;
  saveFishData(data);
}

module.exports = {
  loadFishData,
  saveFishData,
  getUserData,
  getOrInitUserData,
  setUserData
};
