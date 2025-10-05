import { AbstractInputSuggest, App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';

// Remember to rename these classes and interfaces!

interface DailyClonePluginSettings {
	dailyNoteTemplate: string,
	dailyNoteFilenameFormat: string;
	dailyNoteFolder: string;
}

const DEFAULT_SETTINGS: DailyClonePluginSettings = {
	dailyNoteTemplate: '',
	dailyNoteFilenameFormat: 'YYYY-MM-DD',
	dailyNoteFolder: '/',
}

class FolderSuggest extends AbstractInputSuggest<TFolder> {
	inputEl: HTMLInputElement;
	
	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.inputEl = inputEl;
	}

	getSuggestions(query: string): TFolder[] {
		// Get all folders from the vault
		const allFolders = this.app.vault.getAllLoadedFiles()
			.filter((file): file is TFolder => file instanceof TFolder);

		// Always include root folder option
		const suggestions: TFolder[] = [];
		
		// Add a virtual root folder representation if query matches
		if (!query || "/".includes(query.toLowerCase()) || "root".includes(query.toLowerCase())) {
			// Create a virtual root folder for display
			const rootFolder = this.app.vault.getRoot();
			suggestions.push(rootFolder);
		}

		// Filter and add other folders based on query
		const filteredFolders = allFolders.filter(folder => {
			if (!query) return true;
			return folder.path.toLowerCase().includes(query.toLowerCase()) ||
				   folder.name.toLowerCase().includes(query.toLowerCase());
		});

		suggestions.push(...filteredFolders);

		// Remove duplicates and limit results
		const uniqueFolders = suggestions.filter((folder, index, self) => 
			index === self.findIndex(f => f.path === folder.path)
		);

		return uniqueFolders.slice(0, 10);
	}

	renderSuggestion(folder: TFolder, el: HTMLElement): void {
		el.createEl("div", { text: folder.path || "/" });
	}

	selectSuggestion(folder: TFolder): void {
		this.setValue(folder.path);
		// Trigger the input event to ensure onChange handlers are called
		this.inputEl.dispatchEvent(new Event('input'));
		this.close();
	}
}

class FileSuggest extends AbstractInputSuggest<TFile> {
	inputEl: HTMLInputElement;
	
	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.inputEl = inputEl;
	}

	getSuggestions(query: string): TFile[] {
		// Get all files from the vault
		const allFiles = this.app.vault.getAllLoadedFiles()
			.filter((file): file is TFile => file instanceof TFile);

		// Filter files based on query (search by filename or path)
		const filteredFiles = allFiles.filter(file => {
			if (!query) return true;
			const filename = file.basename.toLowerCase();
			const path = file.path.toLowerCase();
			const queryLower = query.toLowerCase();
			
			return filename.includes(queryLower) || path.includes(queryLower);
		});

		// Limit results to 10 items
		return filteredFiles.slice(0, 10);
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.createEl("div", { text: file.path });
	}

	selectSuggestion(file: TFile): void {
		this.setValue(file.path);
		// Trigger the input event to ensure onChange handlers are called
		this.inputEl.dispatchEvent(new Event('input'));
		this.close();
	}
}

async function createDailyNotesBetweenDates(app: App, startDateAsString: string, endDateAsString: string, settings: DailyClonePluginSettings) {
	const startDate = new Date(startDateAsString);
	const endDate = new Date(endDateAsString);

	if (startDate > endDate) {
		new Notice("Invalid Range");
		return;
	}
	
	const dates: string[] = [];
	const date = new Date(startDate);

	while (date <= endDate) {
		dates.push(date.toISOString().split('T')[0]);
		date.setDate(date.getDate() + 1);
	}
	
	new Notice('Done!')
}

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
			}
		);

		new Setting(this.contentEl)
		.setName("End Date")
		.addText(text => {
				text.inputEl.type = "date";
				text.onChange((value) => { endDate = value; });
			}
		);

		new Setting(this.contentEl)
		.addButton(btn => btn.setButtonText("Enter").setCta().onClick(() => {
			this.close();
			createDailyNotesBetweenDates(this.app, startDate, endDate, this.plugin.settings);
		}))
	}
}

export default class DailyClonePlugin extends Plugin {
	settings: DailyClonePluginSettings;

	async onload() {
		await this.loadSettings();
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Clone Daily Notes', async (_evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new InputModal(this.app, this).open();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('daily-clone-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'clone-daily-notes',
			name: 'Clone Daily Notes',
			callback: () => {
				new InputModal(this.app, this).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DailyCloneSettingTab(this.app, this));
		
		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class DailyCloneSettingTab extends PluginSettingTab {
	plugin: DailyClonePlugin;

	constructor(app: App, plugin: DailyClonePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// 1. Headings
		new Setting(containerEl).setName("Daily Note").setHeading();

		// 2. Daily Note Template
		const templateDesc = document.createDocumentFragment();
		templateDesc.append('Choose a template based on ')
		templateDesc.createEl('a', {
			text: 'Templater',
			attr: { href: 'https://github.com/SilentVoid13/Templater' }
		});
		templateDesc.appendText(' plugin.')
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
			})

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
