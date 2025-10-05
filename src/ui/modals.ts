/**
 * Modal components for Daily Clone plugin
 */

import { App, Modal, Setting } from 'obsidian';
import { DailyClonePlugin } from '../types';
import { createDailyNotesBetweenDates } from '../core/dailyNotes';

export class InputModal extends Modal {
	plugin: DailyClonePlugin;

	constructor(app: App, plugin: DailyClonePlugin) {
		super(app);
		this.plugin = plugin;
		this.setTitle("Enter the start/end date");

		let startDate = '', endDate = '';
		
		new Setting(this.contentEl)
			.setName("Start Date")
			.addText(text => {
				text.inputEl.type = "date";
				text.onChange((value) => { startDate = value; });
			});

		new Setting(this.contentEl)
			.setName("End Date")
			.addText(text => {
				text.inputEl.type = "date";
				text.onChange((value) => { endDate = value; });
			});

		new Setting(this.contentEl)
			.addButton(btn => btn.setButtonText("Enter").setCta().onClick(() => {
				this.close();
				createDailyNotesBetweenDates(this.app, startDate, endDate, this.plugin.settings);
			}));
	}
}