import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prefixes = [
  // Mystical
  'Ancient', 'Mystic', 'Cosmic', 'Silent', 'Crystal',
  'Eternal', 'Shadow', 'Storm', 'Frost', 'Ember',
  'Void', 'Astral', 'Lunar', 'Solar', 'Divine',
  'Chaos', 'Dream', 'Spirit', 'Star', 'Night',
  'Dawn', 'Dusk', 'Wild', 'Iron', 'Dark',
  'Light', 'Thunder', 'Flame', 'Ice', 'Wind',
  // New Mystical
  'Ethereal', 'Celestial', 'Arcane', 'Mythic', 'Primal',
  'Radiant', 'Twilight', 'Nebula', 'Phoenix', 'Dragon',
  'Infernal', 'Sacred', 'Spectral', 'Mystic', 'Fabled',
  // Elements
  'Blaze', 'Frost', 'Storm', 'Terra', 'Aero',
  'Aqua', 'Pyro', 'Geo', 'Cryo', 'Electro',
  // Nature
  'Forest', 'Ocean', 'Mountain', 'Desert', 'Arctic',
  'Jungle', 'Valley', 'River', 'Cloud', 'Sky',
  // Cosmic
  'Galaxy', 'Nova', 'Pulsar', 'Quasar', 'Comet',
  'Meteor', 'Stellar', 'Orbit', 'Eclipse', 'Zenith'
];

const nouns = [
  // Original
  'Phoenix', 'Dragon', 'Raven', 'Wolf', 'Serpent',
  'Guardian', 'Warrior', 'Knight', 'Hunter', 'Mage',
  'Titan', 'Oracle', 'Prophet', 'Sage', 'Nomad',
  'Wanderer', 'Seeker', 'Warden', 'Sentinel', 'Scout',
  'Champion', 'Herald', 'Keeper', 'Walker', 'Slayer',
  'Blade', 'Shield', 'Crown', 'Heart', 'Soul',
  // Mythical Creatures
  'Griffin', 'Hydra', 'Sphinx', 'Chimera', 'Wyrm',
  'Drake', 'Basilisk', 'Wyvern', 'Kraken', 'Leviathan',
  'Behemoth', 'Pegasus', 'Unicorn', 'Manticore', 'Harpy',
  // Roles
  'Paladin', 'Ranger', 'Druid', 'Mystic', 'Sorcerer',
  'Warlock', 'Monk', 'Assassin', 'Berserker', 'Templar',
  'Crusader', 'Inquisitor', 'Shaman', 'Necromancer', 'Bard',
  // Elements
  'Flame', 'Frost', 'Storm', 'Stone', 'Wind',
  'Wave', 'Thunder', 'Lightning', 'Shadow', 'Light',
  // Objects
  'Scepter', 'Tome', 'Grimoire', 'Relic', 'Crystal',
  'Artifact', 'Talisman', 'Medallion', 'Chalice', 'Staff'
];

const suffixes = [
  // Original
  'Weaver', 'Bringer', 'Caller', 'Seeker', 'Walker',
  'Master', 'Keeper', 'Singer', 'Dancer', 'Wielder',
  'Slayer', 'Hunter', 'Watcher', 'Guardian', 'Sage',
  'Knight', 'Lord', 'Smith', 'Born', 'Sworn',
  'Blessed', 'Cursed', 'Bound', 'Touched', 'Chosen',
  // New Roles
  'Mender', 'Shaper', 'Forger', 'Breaker', 'Shifter',
  'Whisperer', 'Harbinger', 'Shepherd', 'Wanderer', 'Seeker',
  'Dreamer', 'Seer', 'Prophet', 'Oracle', 'Mystic',
  // Actions
  'Striker', 'Caster', 'Conjurer', 'Summoner', 'Invoker',
  'Channeler', 'Bender', 'Shaper', 'Carver', 'Reaver',
  // States
  'Ascended', 'Awakened', 'Enlightened', 'Transcendent', 'Eternal',
  'Immortal', 'Divine', 'Celestial', 'Fallen', 'Risen',
  // Elements
  'Flame', 'Frost', 'Storm', 'Earth', 'Wind',
  'Water', 'Thunder', 'Shadow', 'Light', 'Void'
];

// Unique standalone names with various themes
const uniqueNames = [
  // Celestial
  'Zephyr', 'Quixotic', 'Ethereal', 'Serendipity', 'Nebula',
  'Halcyon', 'Ephemeral', 'Labyrinth', 'Cascade', 'Zenith',
  'Odyssey', 'Enigma', 'Velvet', 'Quantum', 'Cipher',
  'Aurora', 'Vertex', 'Nexus', 'Prism', 'Celestial',
  // Mythological
  'Avalon', 'Tempest', 'Solstice', 'Echo', 'Paradox',
  'Infinity', 'Axiom', 'Nova', 'Meridian', 'Horizon',
  'Atlas', 'Cosmos', 'Vector', 'Azure', 'Crimson',
  'Obsidian', 'Onyx', 'Phantom', 'Quasar', 'Radiant',
  // Elements
  'Blaze', 'Frost', 'Storm', 'Terra', 'Aether',
  'Aqua', 'Pyro', 'Geo', 'Cryo', 'Electro',
  // Nature
  'Grove', 'Vale', 'Glen', 'Dale', 'Fjord',
  'Mesa', 'Dune', 'Peak', 'Coast', 'Isle',
  // Abstract
  'Epoch', 'Flux', 'Nexus', 'Vertex', 'Cipher',
  'Matrix', 'Vector', 'Prism', 'Helix', 'Vortex'
];

// Additional name patterns
const patterns = [
  // Color combinations
  'Crimson', 'Azure', 'Violet', 'Amber', 'Cobalt',
  'Scarlet', 'Indigo', 'Emerald', 'Sapphire', 'Ruby',
  // Time-related
  'Dawn', 'Dusk', 'Twilight', 'Midnight', 'Eclipse',
  'Solstice', 'Equinox', 'Eternal', 'Temporal', 'Infinite',
  // Weather
  'Storm', 'Thunder', 'Lightning', 'Tempest', 'Hurricane',
  'Cyclone', 'Tornado', 'Blizzard', 'Monsoon', 'Typhoon',
  // Cosmic
  'Nebula', 'Galaxy', 'Cosmos', 'Astral', 'Stellar',
  'Solar', 'Lunar', 'Celestial', 'Cosmic', 'Orbital'
];

class UsernameManager {
  constructor() {
    this.usedNamesFile = path.join(__dirname, '../../used_usernames.json');
    this.usedNames = this.loadUsedNames();
    this.maxStoredNames = 1000; // Limit stored names to prevent file growth
  }

  loadUsedNames() {
    try {
      if (fs.existsSync(this.usedNamesFile)) {
        return JSON.parse(fs.readFileSync(this.usedNamesFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading used names:', error);
    }
    return [];
  }

  saveUsedNames() {
    try {
      // Keep only the most recent names
      if (this.usedNames.length > this.maxStoredNames) {
        this.usedNames = this.usedNames.slice(-this.maxStoredNames);
      }
      fs.writeFileSync(this.usedNamesFile, JSON.stringify(this.usedNames, null, 2));
    } catch (error) {
      console.error('Error saving used names:', error);
    }
  }

  generateCombinedName() {
    const patterns = [
      // Basic patterns
      () => this.getRandomElement(prefixes) + this.getRandomElement(nouns),
      () => this.getRandomElement(prefixes) + this.getRandomElement(nouns) + this.getRandomElement(suffixes),
      () => this.getRandomElement(nouns) + this.getRandomElement(suffixes),
      () => this.getRandomElement(uniqueNames),
      // Advanced patterns
      () => this.getRandomElement(patterns) + this.getRandomElement(nouns),
      () => this.getRandomElement(prefixes) + this.getRandomElement(patterns),
      () => this.getRandomElement(uniqueNames) + this.getRandomElement(suffixes),
      () => this.getRandomElement(patterns) + this.getRandomElement(suffixes),
      // Complex combinations
      () => this.getRandomElement(prefixes) + this.getRandomElement(patterns) + this.getRandomElement(nouns),
      () => this.getRandomElement(patterns) + this.getRandomElement(nouns) + this.getRandomElement(suffixes),
      // Dynamic combinations
      () => {
        const base = this.getRandomElement([...prefixes, ...patterns, ...uniqueNames]);
        const middle = this.getRandomElement([...nouns, ...patterns]);
        const end = this.getRandomElement([...suffixes, ...patterns]);
        return base + middle + end;
      }
    ];

    return this.getRandomElement(patterns)();
  }

  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getUsername(config) {
    if (!config.bot.useRandomUsername) {
      return config.bot.username;
    }

    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const name = this.generateCombinedName();
      
      // Ensure name meets Minecraft username requirements
      if (name.length >= 3 && name.length <= 16 && /^[a-zA-Z0-9_]+$/.test(name)) {
        if (!this.usedNames.includes(name)) {
          this.usedNames.push(name);
          this.saveUsedNames();
          return name;
        }
      }
      
      attempts++;
    }

    // If we've used too many names or can't find a unique one, generate a fallback
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    const fallbackName = `Player${timestamp}${randomSuffix}`;
    
    this.usedNames.push(fallbackName);
    this.saveUsedNames();
    return fallbackName;
  }
}

export const usernameManager = new UsernameManager();