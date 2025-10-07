/**
 * Settings tab UI for Daily Clone plugin
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import { DailyClonePlugin, FrontmatterProperty } from '../types';
import { FileSuggest, FolderSuggest } from '../ui/suggests';
import { FrontmatterParser } from 'src/utils/frontmatterParser';

export class DailyCloneSettingTab extends PluginSettingTab {
	plugin: DailyClonePlugin;
	private dailyNoteFrontmatterContainer: HTMLElement | null = null;
	private frontmatterParser: FrontmatterParser;

	constructor(app: App, plugin: DailyClonePlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.frontmatterParser = new FrontmatterParser(app);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// 1. Daily Note Settings Heading
		new Setting(containerEl).setName("Daily Note").setHeading();

		// 1-a. Daily Note Filename Format
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

		// 1-b. Daily Note Folder
		new Setting(containerEl)
			.setName('Destination Folder')
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

		// 1-c. Daily Note Template
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
						await this.loadFrontmatterProperties(value);
					});
				
				// Add FileSuggest to this text input
				new FileSuggest(this.app, text.inputEl);
			});
		
		this.dailyNoteFrontmatterContainer = containerEl.createDiv();
		if (this.plugin.settings.dailyNoteTemplate) { 
			this.loadFrontmatterProperties(this.plugin.settings.dailyNoteTemplate)
		}
	}

	private async loadFrontmatterProperties(templatePath: string): Promise<void> {
		// Clear frontmatterProperties
		this.plugin.settings.dailyNoteFrontmatterProperties = {};	

		// Clear frontmatterContainer section
		if (!this.dailyNoteFrontmatterContainer) return;
		this.dailyNoteFrontmatterContainer.empty();

		// Handle no value in templatePath setting
		if (!templatePath) {
			return;
		}

		const properties = await this.frontmatterParser.parseFrontmatterFromTemplate(templatePath)
		if (properties.length === 0) return;

		new Setting(this.dailyNoteFrontmatterContainer)
			.setName("Template Frontmatter Properties")
			.setHeading();
		
		new Setting(this.dailyNoteFrontmatterContainer)
			.setDesc("Configure frontmatter properties found in your template file");

		for (const property of properties) {
			this.plugin.settings.dailyNoteFrontmatterProperties[property.key] = {
				...property,
				enabled: false
			}
			await this.plugin.saveSettings();
			await this.createFrontmatterPropertySetting(property)
		}
	}

	private async createFrontmatterPropertySetting(property: FrontmatterProperty): Promise<void> {
		if (!this.dailyNoteFrontmatterContainer) return;

		const currentProperty = this.plugin.settings.dailyNoteFrontmatterProperties[property.key] || property;
		
		new Setting(this.dailyNoteFrontmatterContainer)
			.setName(property.key)
			.setDesc(`Frontmatter property (default: ${property.defaultValue || 'Empty'})`)
			.addToggle(toggle => {
				toggle.setValue(currentProperty.enabled)
					.onChange(async (value) => {
						this.plugin.settings.dailyNoteFrontmatterProperties[property.key] = {
							...currentProperty,
							enabled: value
						};
						await this.plugin.saveSettings();
					});
			});
	}
}