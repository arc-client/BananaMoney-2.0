/**
 * 🍌 BananaMoney Lite - Pathfinding Manager
 * "World Best" Pathfinding using mineflayer-pathfinder
 */

import pkg from 'mineflayer-pathfinder';
const { pathfinder, Movements, goals } = pkg;
import Logger from '../utils/logger.js';

export class PathfindingManager {
    constructor(bot) {
        this.bot = bot;
        this.mcData = null;
        this.movements = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        this.bot.loadPlugin(pathfinder);

        try {
            import('minecraft-data').then(mcDataModule => {
                this.mcData = mcDataModule.default(this.bot.version);
                this.movements = new Movements(this.bot, this.mcData);

                // "World Best" Configuration: Reliability over Speed
                this.movements.canDig = false; // Don't break blocks unless necessary (stuck)
                this.movements.digCost = 100; // High cost to discourage breaking
                this.movements.placeCost = 100; // High cost to discourage placing
                this.movements.allowParkour = false; // Parkour is risky for bots
                this.movements.allowSprinting = true; // Sprinting is fine
                this.movements.infiniteLiquidDropdownDistance = true; // Allow dropping into water

                this.bot.pathfinder.setMovements(this.movements);
                this.initialized = true;
                Logger.system('Pathfinding Manager initialized.');
            });
        } catch (err) {
            Logger.error(`Failed to init pathfinding: ${err.message}`);
        }
    }

    /**
     * Move to a specific position safely
     * @param {Object} pos - {x, y, z}
     * @param {number} range - Distance to stop from target
     */
    async goTo(pos, range = 1) {
        if (!this.initialized || !this.bot.pathfinder) {
            Logger.error('Pathfinding not initialized');
            return false;
        }

        if (!pos) return false;

        const goal = new goals.GoalNear(pos.x, pos.y, pos.z, range);

        try {
            await this.bot.pathfinder.goto(goal);
            return true;
        } catch (err) {
            // Handle "GoalChanged" or "PathStopped" gracefully
            if (err.message?.includes('GoalChanged')) return false;

            Logger.error(`Pathfinding error: ${err.message}`);
            return false;
        }
    }

    stop() {
        if (this.bot.pathfinder) {
            this.bot.pathfinder.stop();
        }
    }

    isMoving() {
        return this.bot.pathfinder && this.bot.pathfinder.isMoving();
    }
}
