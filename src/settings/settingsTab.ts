/**
 * Settings tab UI for Daily Clone plugin
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import { DailyClonePlugin } from '../types';
import { FileSuggest, FolderSuggest } from '../ui/suggests';

export class DailyCloneSettingTab extends PluginSettingTab {
	plugin: DailyClonePlugin;

	constructor(app: App, plugin: DailyClonePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// 1. Daily Note Settings Heading
		new Setting(containerEl).setName("Daily Note").setHeading();

		// 2. Daily Note Template
		const templateDesc = document.createDocumentFragment();
		templateDesc.append('Choose a template based on ');
		templateDesc.createEl('a', {
			text: 'Templater',
			attr: { href: 'https://github.com/SilentVoid13/Templater' }
		});
		templateDesc.appendText(' plugin.');

		new Setting(containerEl)
			.setName('Template')
			.setDesc(templateDesc)
			.addText((text) => {
				text.setPlaceholder("Type to search a template...")
					.setValue(this.plugin.settings.dailyNoteTemplate)
					.onChange(async (value) => {
						this.plugin.settings.dailyNoteTemplate = value;
						await this.plugin.saveSettings();
					});
				
				// Add FileSuggest to this text input
				new FileSuggest(this.app, text.inputEl);
			});

		// 3. Daily Note Filename Format
		const dailyNoteFilenameFormatDesc = document.createDocumentFragment();
		dailyNoteFilenameFormatDesc.appendText('For a list of all available tokens, see the ');
		dailyNoteFilenameFormatDesc.createEl('a', {
			text: 'reference to moment.js',
			attr: { href: 'https://momentjs.com/docs/#/displaying/format/', target: '_blank' }
		});
		dailyNoteFilenameFormatDesc.createEl('br');
		dailyNoteFilenameFormatDesc.appendText('Your current syntax looks like this: ');
		const dateSampleEl = dailyNoteFilenameFormatDesc.createEl('b', 'u-pop');

		new Setting(containerEl)
			.setName('File Name Format')
			.setDesc(dailyNoteFilenameFormatDesc)
			.addMomentFormat(momentFormat => momentFormat
				.setValue(this.plugin.settings.dailyNoteFilenameFormat)
				.setSampleEl(dateSampleEl)
				.setDefaultFormat('YYYY-MM-DD')
				.onChange(async (value) => {
					this.plugin.settings.dailyNoteFilenameFormat = value;
					await this.plugin.saveSettings();
				}));

		// 4. Daily Note Folder
		new Setting(containerEl)
			.setName('Folder')
			.setDesc('Choose a folder where daily notes will be created')
			.addText((text) => {
				text.setPlaceholder("Type to search folders...")
					.setValue(this.plugin.settings.dailyNoteFolder)
					.onChange(async (value) => {
						this.plugin.settings.dailyNoteFolder = value;
						await this.plugin.saveSettings();
					});
				
				// Add FolderSuggest to this text input
				new FolderSuggest(this.app, text.inputEl);
			});
	}
}