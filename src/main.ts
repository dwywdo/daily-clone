/**
 * Daily Clone Plugin for Obsidian
 * 
 * A plugin that helps users mass create daily notes between specified date ranges.
 */

import { Plugin } from 'obsidian';
import { DailyClonePluginSettings } from './types';
import { DEFAULT_SETTINGS, DailyCloneSettingTab } from './settings';
import { InputModal } from './ui/modals';

export default class DailyClonePlugin extends Plugin {
	settings: DailyClonePluginSettings;

	async onload() {
		await this.loadSettings();

		// Add ribbon icon
		this.addRibbonIcon('dice', 'Clone Daily Notes', () => {
			new InputModal(this.app, this).open();
		});

		// Add command palette command
		this.addCommand({
			id: 'clone-daily-notes',
			name: 'Clone Daily Notes',
			callback: () => {
				new InputModal(this.app, this).open();
			}
		});

		// Add settings tab
		this.addSettingTab(new DailyCloneSettingTab(this.app, this));
	}

	onunload() {
		// Cleanup if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}