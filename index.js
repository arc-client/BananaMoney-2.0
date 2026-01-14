/**
 * 🍌 BananaMoney Lite - Entry Point
 */

import './src/utils/polyfill.js'; // MUST be first
import { BananaBot } from './src/BananaBot.js';
import { readFileSync } from 'fs';
import readline from 'readline';

// Load config
const config = JSON.parse(readFileSync('./config/config.json', 'utf-8'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🍌 BananaMoney Lite Setup');
rl.question(`Enter username (default: ${config.username}): `, (answer) => {
  rl.close();

  if (answer.trim()) {
    config.username = answer.trim();
  }

  // Start bot
  const bot = new BananaBot(config);
  bot.init();
});

// Handle exit
process.on('SIGINT', () => {
  console.log('\n🍌 Exiting...');
  process.exit(0);
});