/**
 * Profile Manager
 * Handles saving and loading of configuration profiles (chest/spawner positions)
 */

import fs from 'fs';
import path from 'path';
import Logger from './logger.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILES_FILE = path.join(__dirname, '../../profiles.json');

export class ProfileManager {
    constructor() {
        this.profiles = {};
        this.loadProfiles();
    }

    loadProfiles() {
        try {
            if (fs.existsSync(PROFILES_FILE)) {
                const data = fs.readFileSync(PROFILES_FILE, 'utf8');
                this.profiles = JSON.parse(data);
            }
        } catch (err) {
            Logger.error(`Failed to load profiles: ${err.message}`);
            this.profiles = {};
        }
    }

    saveProfiles() {
        try {
            fs.writeFileSync(PROFILES_FILE, JSON.stringify(this.profiles, null, 2));
            return true;
        } catch (err) {
            Logger.error(`Failed to save profiles: ${err.message}`);
            return false;
        }
    }

    getProfile(name) {
        return this.profiles[name];
    }

    saveProfile(name, data) {
        this.profiles[name] = data;
        if (this.saveProfiles()) {
            Logger.system(`Profile "${name}" saved.`);
            return true;
        }
        return false;
    }

    deleteProfile(name) {
        if (this.profiles[name]) {
            delete this.profiles[name];
            return this.saveProfiles();
        }
        return false;
    }

    listProfiles() {
        return Object.keys(this.profiles);
    }
}
