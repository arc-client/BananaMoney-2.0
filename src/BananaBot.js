/**
 * 🍌 BananaMoney Lite - Core Bot
 */

import mineflayer from 'mineflayer';
import readline from 'readline';
import Logger from './utils/logger.js';
import { AliasManager } from './utils/AliasManager.js';
import { BoneCollector } from './modules/BoneCollector.js';
import { GuiManager } from './modules/GuiManager.js';

export class BananaBot {
    constructor(config) {
        this.config = config;
        this.bot = null;
        this.boneCollector = null;
        this.guiManager = null;
        this.aliasManager = null;
        this.scripts = new Map();
        this.scriptIdCounter = 1;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '🍌 > '
        });

        // Connect logger to readline for clean output
        Logger.setReadline(this.rl);
    }

    /**
     * Initialize the bot
     */
    init() {
        Logger.showBanner();
        this.connect();
        this.setupConsole();
        this.rl.prompt();
    }

    /**
     * Connect to Minecraft server
     */
    connect() {
        Logger.system(`Connecting to ${this.config.host} as ${this.config.username}...`);

        this.bot = mineflayer.createBot({
            host: this.config.host,
            port: this.config.port,
            username: this.config.username,
            version: this.config.version,
            auth: this.config.auth,
            hideErrors: true,
            physicsEnabled: true
        });

        this.setupEvents();
        this.initModules();
    }

    /**
     * Initialize modules
     */
    initModules() {
        this.boneCollector = new BoneCollector(this.bot, this.config);
        this.guiManager = new GuiManager(this.bot);
        this.aliasManager = new AliasManager(this.config);

        this.bot.once('spawn', () => {
            this.boneCollector.init();
        });
    }

    /**
     * Setup bot events
     */
    setupEvents() {
        // Catch unhandled errors from mineflayer internals (like the passengers bug)
        this.bot._client.on('error', (err) => {
            Logger.error(`Protocol error (ignored): ${err.message}`);
        });

        // Catch uncaught exceptions to prevent crash
        process.on('uncaughtException', (err) => {
            // Ignore the known mineflayer passengers bug
            if (err.message?.includes('passengers') || err.message?.includes('Cannot read properties of undefined')) {
                Logger.error(`Mineflayer bug caught (ignored): ${err.message}`);
                return;
            }
            Logger.error(`Uncaught Exception: ${err.message}`);
            console.error(err.stack);
        });

        // Catch unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            Logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
            // Do not exit
        });

        this.bot.on('spawn', () => {
            Logger.system('Bot successfully spawned! 🍌');
            Logger.system('Use !help for commands');
        });

        this.bot.on('messagestr', (message, position, jsonMsg) => {
            if (position === 'game_info') return;
            Logger.log(message, 'CHAT');
        });

        this.bot.on('windowOpen', (window) => {
            Logger.system(`Window opened: ${window.title || window.type}`);
        });

        this.bot.on('error', (err) => {
            Logger.error(`Error: ${err.message}`);
        });

        this.bot.on('kicked', (reason) => {
            let msg = reason;
            try {
                const json = JSON.parse(reason);
                msg = json.text || json.translate || json.extra?.[0]?.text || reason;
            } catch (e) {
                if (typeof reason === 'object') {
                    msg = reason.text || reason.translate || JSON.stringify(reason);
                }
            }
            Logger.error(`Kicked: ${msg}`);
        });

        this.bot.on('end', () => {
            Logger.error('Disconnected. Reconnecting in 5s...');
            if (this.config.autoReconnect) {
                setTimeout(() => this.connect(), this.config.reconnectDelay);
            }
        });
    }

    /**
     * Setup console input
     */
    setupConsole() {
        this.rl.on('line', (input) => {
            let raw = input.trim();

            if (!raw) {
                this.rl.prompt();
                return;
            }

            // Resolve aliases
            if (this.aliasManager) {
                raw = this.aliasManager.resolve(raw);
            }

            // Check for command prefix
            if (raw.startsWith('!')) {
                this.handleCommand(raw.slice(1));
            } else {
                // Regular chat
                if (this.bot && this.bot.entity) {
                    this.bot.chat(raw);
                    Logger.log(`[YOU] ${raw}`, 'CHAT');
                } else {
                    Logger.error('Bot not connected.');
                }
            }

            this.rl.prompt();
        });
    }

    /**
     * Handle console commands
     */
    handleCommand(input) {
        const args = input.toLowerCase().split(' ');
        const cmd = args[0];

        switch (cmd) {
            case 'help':
                Logger.system('=== Commands ===');
                Logger.info('!bones on/off   - Toggle bone collector');
                Logger.info('!gui            - Show current window');
                Logger.info('!click <slot>   - Click window slot');
                Logger.info('!shift <slot>   - Shift-click slot');
                Logger.info('!close          - Close window');
                Logger.info('!spawner x y z  - Set spawner position');
                Logger.info('!chest x y z    - Set chest position');
                Logger.info('!repeat <sec> <cmd> - Repeat command every X sec');
                Logger.info('!list           - List active scripts');
                Logger.info('!stop <id>      - Stop a script by ID');
                Logger.info('(No prefix)     - Send chat message');
                break;

            case 'bones':
                if (args[1] === 'on') {
                    if (this.boneCollector) this.boneCollector.start();
                } else if (args[1] === 'off') {
                    if (this.boneCollector) this.boneCollector.stop();
                } else {
                    Logger.error('Usage: !bones on/off');
                }
                break;

            case 'gui':
            case 'window':
                if (this.guiManager) this.guiManager.showWindow();
                break;

            case 'click':
                if (args[1] && this.guiManager) {
                    this.guiManager.clickSlot(args[1]);
                } else {
                    Logger.error('Usage: !click <slot>');
                }
                break;

            case 'shift':
                if (args[1] && this.guiManager) {
                    this.guiManager.shiftClick(args[1]);
                } else {
                    Logger.error('Usage: !shift <slot>');
                }
                break;

            case 'close':
                if (this.guiManager) this.guiManager.closeWindow();
                break;

            case 'spawner':
                if (args.length === 4) {
                    const x = parseInt(args[1]);
                    const y = parseInt(args[2]);
                    const z = parseInt(args[3]);
                    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                        this.config.boneCollector.spawnerPos = { x, y, z };
                        import('./utils/config.js').then(({ saveConfig }) => {
                            if (saveConfig(this.config)) {
                                Logger.system(`Spawner position updated to ${x}, ${y}, ${z}`);
                            } else {
                                Logger.error('Failed to save config');
                            }
                        });
                        // Update runtime module if active
                        if (this.boneCollector) this.boneCollector.config.spawnerPos = { x, y, z };
                    } else {
                        Logger.error('Invalid coordinates. Usage: !spawner <x> <y> <z>');
                    }
                } else {
                    Logger.error('Usage: !spawner <x> <y> <z>');
                }
                break;

            case 'chest':
                if (args.length === 4) {
                    const x = parseInt(args[1]);
                    const y = parseInt(args[2]);
                    const z = parseInt(args[3]);
                    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                        this.config.boneCollector.chestPos = { x, y, z };
                        import('./utils/config.js').then(({ saveConfig }) => {
                            if (saveConfig(this.config)) {
                                Logger.system(`Chest position updated to ${x}, ${y}, ${z}`);
                            } else {
                                Logger.error('Failed to save config');
                            }
                        });
                        // Update runtime module if active
                        if (this.boneCollector) this.boneCollector.config.chestPos = { x, y, z };
                    } else {
                        Logger.error('Invalid coordinates. Usage: !chest <x> <y> <z>');
                    }
                } else {
                    Logger.error('Usage: !chest <x> <y> <z>');
                }
                break;


            case 'repeat':
            case 'loop':
                if (args.length >= 3) {
                    const seconds = parseFloat(args[1]);
                    const commandToRun = args.slice(2).join(' ');

                    if (!isNaN(seconds) && seconds > 0 && commandToRun) {
                        const id = this.scriptIdCounter++;
                        const interval = setInterval(() => {
                            if (this.bot) this.bot.chat(commandToRun);
                        }, seconds * 1000);

                        this.scripts.set(id, {
                            interval: interval,
                            command: commandToRun,
                            seconds: seconds
                        });

                        Logger.system(`Script #${id} started: "${commandToRun}" every ${seconds}s`);
                    } else {
                        Logger.error('Invalid arguments. Usage: !repeat <seconds> <command>');
                    }
                } else {
                    Logger.error('Usage: !repeat <seconds> <command>');
                }
                break;

            case 'scripts':
            case 'list':
                if (this.scripts.size === 0) {
                    Logger.info('No active scripts running.');
                } else {
                    Logger.system('=== Active Scripts ===');
                    this.scripts.forEach((script, id) => {
                        Logger.info(`#${id}: "${script.command}" (every ${script.seconds}s)`);
                    });
                }
                break;

            case 'stop':
            case 'unloop':
                if (args[1]) {
                    const id = parseInt(args[1]);
                    if (this.scripts.has(id)) {
                        clearInterval(this.scripts.get(id).interval);
                        this.scripts.delete(id);
                        Logger.system(`Script #${id} stopped.`);
                    } else {
                        Logger.error(`Script #${id} not found.`);
                    }
                } else {
                    Logger.error('Usage: !stop <id>');
                }
                break;

            default:
                Logger.error(`Unknown command: ${cmd}. Type !help`);
        }
    }
}
