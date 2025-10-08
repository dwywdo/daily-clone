/**
 * Core daily notes creation functionality
 */

import { App, Notice, TFile, moment } from 'obsidian';
import { DailyClonePluginSettings } from '../types';

export async function createDailyNotesBetweenDates(
	app: App, 
	startDateAsString: string, 
	endDateAsString: string, 
	settings: DailyClonePluginSettings
): Promise<void> {
	const startDate = new Date(startDateAsString);
	const endDate = new Date(endDateAsString);
	if (startDate > endDate) {
		new Notice("Invalid date range: start date must be before or equal to end date");
		return;
	}

	const templaterPlugin = (app as any).plugins.plugins["templater-obsidian"]?.templater?.current_functions_object
	if (!templaterPlugin) {
		new Notice(`Templater is not installed`)
		return;
	}

	// Ensure folder exists
	const folder = settings.dailyNoteFolder || "/";
	if (folder !== "/" && !(await app.vault.adapter.exists(folder))) {
		new Notice(`There's no '${folder}'`)
		return
	}

	// Load template content if specified
	if (!settings.dailyNoteTemplate) {
		new Notice("Template is not configured.")
		return
	}

	try {
		app.vault.getAbstractFileByPath(settings.dailyNoteTemplate);
	} catch (error) {
		new Notice(`Could not load template: ${settings.dailyNoteTemplate}`)
		return
	}

	// Generate files for date range
	const currentDate = new Date(startDate);
	let createdCount = 0;
	let skippedCount = 0;

	while (currentDate <= endDate) {
		try {
			// Format filename using moment
			const filenameFormat = settings.dailyNoteFilenameFormat || "YYYY-MM-DD";
			const filename = moment(currentDate).format(filenameFormat);
			const filePath = folder === "/" ? `${filename}.md` : `${folder}/${filename}.md`;

			// Check if file already exists
			if (await app.vault.adapter.exists(filePath)) {
				skippedCount++;
			} else {
				templaterPlugin.file.create_new(
					templaterPlugin.file.find_tfile(settings.dailyNoteTemplate), 
					filename,
					false,
					settings.dailyNoteFolder
				)
				createdCount++;
			}
		} catch (error) {
			console.error("Error creating daily note:", error);
		}

		// Move to next day
		currentDate.setDate(currentDate.getDate() + 1);
	}

	// Provide user feedback
	let message = `Created ${createdCount} daily notes`;
	if (skippedCount > 0) {
		message += `, skipped ${skippedCount} existing files`;
	}
	new Notice(message);
}