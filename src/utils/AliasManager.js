/**
 * Alias Manager
 * Handles resolution of command and chat aliases
 */
import Logger from './logger.js';

export class AliasManager {
    constructor(config) {
        this.config = config;
        this.aliases = this.config.aliases || {};
    }

    /**
     * Resolve input string against aliases
     * @param {string} input - Raw console input
     * @returns {string} - Resolved input
     */
    resolve(input) {
        if (!input) return input;

        // Split input into command/key and arguments
        const parts = input.trim().split(' ');
        const key = parts[0]; // e.g., "!c" or "!h"

        if (this.aliases[key]) {
            const aliasValue = this.aliases[key];

            // If alias is a command (starts with !), append arguments
            // If alias is chat (no !), just return the alias value + args if any, 
            // but usually for chat aliases people might just want the replacement.
            // Let's support preserving arguments for commands like invalid "!c 15" -> "!click 15"

            const args = parts.slice(1).join(' ');

            if (args.length > 0) {
                return `${aliasValue} ${args}`;
            }
            return aliasValue;
        }

        return input;
    }
}
