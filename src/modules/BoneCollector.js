/**
 * 🍌 BananaMoney Lite - Bone Collector Module
 * Using manual walking as fallback when pathfinder doesn't move
 */

import Logger from '../utils/logger.js';
import Logger from '../utils/logger.js';

export class BoneCollector {
    constructor(bot, config, pathfinder) {
        this.bot = bot;
        this.config = config.boneCollector || {};
        this.pathfinder = pathfinder; // Injected dependency
        this.running = false;
        this.initialized = false;
        this.chestFull = false;
        this.mcData = null;
    }

    async init() {
        if (this.initialized) return;
        // Pathfinding is handled globally now
        this.initialized = true;
        Logger.system('Bone Collector: Ready');
    }

    async start() {
        if (this.running) return;

        if (!this.initialized) await this.init();

        this.running = true;
        this.chestFull = false;
        Logger.system('🦴 Bone Collector: STARTED');

        while (this.running && !this.chestFull) {
            try {
                await this.collectCycle();
                if (this.running && !this.chestFull) {
                    Logger.system(`Waiting ${(this.config.cycleDelay || 5000) / 1000}s...`);
                    await this.sleep(this.config.cycleDelay || 5000);
                }
            } catch (err) {
                Logger.error(`Error: ${err.message}`);
                this.stopMovement();
                await this.sleep(3000);
            }
        }
    }

    stop() {
        this.running = false;
        this.stopMovement();
        Logger.system('🦴 Bone Collector: STOPPED');
    }

    stopMovement() {
        if (this.pathfinder) this.pathfinder.stop();
        this.bot.setControlState('forward', false);
        this.bot.setControlState('sprint', false);
        this.bot.setControlState('jump', false);
    }

    async collectCycle() {
        this.stopMovement();
        await this.sleep(200);

        // Go to spawner
        Logger.system('→ Walking to spawner...');
        await this.pathfinder.goTo(this.config.spawnerPos);
        await this.sleep(500);

        // Open spawner
        Logger.system('→ Opening spawner...');
        await this.interactWithBlock(this.config.spawnerPos);
        await this.sleep(800);

        if (!this.bot.currentWindow) {
            Logger.error('Spawner menu failed');
            return;
        }

        // Click loot slot
        const slot = this.config.collectSlot ?? 13;
        Logger.system(`→ Clicking slot ${slot}...`);
        try { await this.bot.clickWindow(slot, 0, 0); } catch (e) { }
        await this.sleep(800);

        // Collect bones
        Logger.system('→ Collecting...');
        const collected = await this.shiftClickAllBones();
        Logger.system(`Got ${collected} stacks`);

        this.closeCurrentWindow();
        await this.sleep(500);

        // Go to chest
        Logger.system('→ Walking to chest...');
        await this.pathfinder.goTo(this.config.chestPos);
        await this.sleep(500);

        // Deposit
        Logger.system('→ Depositing...');
        await this.depositViaShiftClick();
    }

    /**
     * Manual walking - look at target and walk forward
     */


    async interactWithBlock(pos) {
        const Vec3 = (await import('vec3')).default;
        // Try the exact block first
        let block = this.bot.blockAt(new Vec3(pos.x, pos.y, pos.z));

        // If not interactable, look for nearby spawner or chest
        if (!block || block.name === 'air') {
            Logger.system(`Block at exact pos: ${block ? block.name : 'null'}, searching nearby...`);

            // Search in a small radius
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dz = -2; dz <= 2; dz++) {
                        const checkBlock = this.bot.blockAt(new Vec3(pos.x + dx, pos.y + dy, pos.z + dz));
                        if (checkBlock && checkBlock.name !== 'air' &&
                            (checkBlock.name.includes('spawner') || checkBlock.name.includes('chest') ||
                                checkBlock.name.includes('skull') || checkBlock.name.includes('head'))) {
                            block = checkBlock;
                            Logger.system(`Found: ${block.name} at offset (${dx},${dy},${dz})`);
                            break;
                        }
                    }
                    if (block && block.name !== 'air') break;
                }
                if (block && block.name !== 'air') break;
            }
        }

        if (!block || block.name === 'air') {
            Logger.error(`No interactable block found near ${pos.x}, ${pos.y}, ${pos.z}`);
            return;
        }

        Logger.system(`Interacting with: ${block.name}`);
        await this.bot.lookAt(block.position.offset(0.5, 0.5, 0.5));
        await this.sleep(300);

        try {
            await this.bot.activateBlock(block);
        } catch (e) {
            Logger.error(`Activate error: ${e.message}`);
        }
    }

    async shiftClickAllBones() {
        const window = this.bot.currentWindow;
        if (!window) return 0;

        let count = 0;
        for (let i = 0; i < window.slots.length && this.running; i++) {
            const item = window.slots[i];
            if (!item || !item.name) continue;
            if (!item.name.includes('bone')) continue;

            if (this.bot.inventory.emptySlotCount() === 0) break;

            try {
                await this.bot.clickWindow(i, 0, 1);
                count++;
                await this.sleep(80);
            } catch (e) { }
        }
        return count;
    }

    async depositViaShiftClick() {
        const chestPos = this.config.chestPos;
        const chestBlock = this.bot.blockAt(new Vec3(chestPos.x, chestPos.y, chestPos.z));

        if (!chestBlock) {
            Logger.error('Chest not found!');
            return;
        }

        await this.bot.lookAt(new Vec3(chestPos.x + 0.5, chestPos.y + 0.5, chestPos.z + 0.5));
        await this.sleep(200);
        await this.bot.activateBlock(chestBlock);
        await this.sleep(800);

        const window = this.bot.currentWindow;
        if (!window) {
            Logger.error('Chest not open!');
            return;
        }

        const chestSlots = window.type === 'minecraft:generic_9x6' ? 54 : 27;
        let deposited = 0;
        let failed = 0;

        for (let i = chestSlots; i < window.slots.length && this.running; i++) {
            const item = window.slots[i];
            if (!item || !item.name) continue;
            if (!item.name.includes('bone')) continue;

            try {
                await this.bot.clickWindow(i, 0, 1);
                deposited++;
                await this.sleep(100);
            } catch (e) {
                failed++;
                if (failed >= 3) {
                    this.chestFull = true;
                    break;
                }
            }
        }

        Logger.system(`Deposited ${deposited} stacks`);
        this.closeCurrentWindow();
    }

    closeCurrentWindow() {
        try {
            if (this.bot.currentWindow) {
                this.bot.closeWindow(this.bot.currentWindow);
            }
        } catch (e) { }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
