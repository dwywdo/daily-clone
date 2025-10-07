/**
 * Type definitions for the Daily Clone plugin
 */

import { Plugin } from 'obsidian';

export interface FrontmatterProperty {
	key: string,
	defaultValue: string,
	enabled: boolean
}

export interface DailyClonePluginSettings {
	dailyNoteTemplate: string;
	dailyNoteFilenameFormat: string;
	dailyNoteFolder: string;
	dailyNoteFrontmatterProperties: Record<string, FrontmatterProperty>;
}

export interface DailyClonePlugin extends Plugin {
	settings: DailyClonePluginSettings;
	loadSettings(): Promise<void>;
	saveSettings(): Promise<void>;
}