/**
 * 🍌 BananaMoney Lite - Entry Point
 */

import { BananaBot } from './src/BananaBot.js';
import { readFileSync } from 'fs';

// Load config
const config = JSON.parse(readFileSync('./config/config.json', 'utf-8'));

// Start bot
const bot = new BananaBot(config);
bot.init();

// Handle exit
process.on('SIGINT', () => {
  console.log('\n🍌 Exiting...');
  process.exit(0);
});