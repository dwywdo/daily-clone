import { setEngine } from 'crypto';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface DailyClonePluginSettings {
	dailyCloneSetting: string;
}

const DEFAULT_SETTINGS: DailyClonePluginSettings = {
	dailyCloneSetting: 'default'
}

async function createDailyNotesBetweenDates(app: App, startDateAsString: string, endDateAsString: string) {
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

	for (const date of dates) {
		const dailyNotePath = `${date}.md`;
		if (!(await app.vault.adapter.exists(dailyNotePath))) {
			await app.vault.create(dailyNotePath, `# ${date}\n`);
		}
	}

	new Notice(`Created ${dates.length} Daily Notes`);
}

export class InputModal extends Modal {
	constructor(app: App) {
		super(app);
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
			createDailyNotesBetweenDates(this.app, startDate, endDate);
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
			new InputModal(this.app).open();
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
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DailyCloneSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
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

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.dailyCloneSetting)
				.onChange(async (value) => {
					this.plugin.settings.dailyCloneSetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
