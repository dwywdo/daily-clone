/**
 * Input suggestion components for Daily Clone plugin
 */

import { AbstractInputSuggest, App, TFile, TFolder } from 'obsidian';

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
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

export class FileSuggest extends AbstractInputSuggest<TFile> {
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