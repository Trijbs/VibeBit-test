const fs = require('fs');
const path = require('path');
const commandsDir = path.join(__dirname, 'commands');
const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
if (files.length === 0) {
  console.error('No command files found');
  process.exit(1);
}
console.log(`Found ${files.length} command files.`);
