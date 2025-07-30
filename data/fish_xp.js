const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'fish_xp.json');

function loadXPData() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveXPData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getXP(userId) {
  const xpData = loadXPData();
  return xpData[userId] || 0;
}

function addXP(userId, amount) {
  const xpData = loadXPData();
  xpData[userId] = (xpData[userId] || 0) + amount;
  saveXPData(xpData);
}

module.exports = {
  getXP,
  addXP,
  loadXPData,
  saveXPData
};
