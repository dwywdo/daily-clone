/**
 * Type definitions for the Daily Clone plugin
 */

import { Plugin } from 'obsidian';

export interface DailyClonePluginSettings {
	dailyNoteTemplate: string;
	dailyNoteFilenameFormat: string;
	dailyNoteFolder: string;
}

export interface DailyClonePlugin extends Plugin {
	settings: DailyClonePluginSettings;
	loadSettings(): Promise<void>;
	saveSettings(): Promise<void>;
}